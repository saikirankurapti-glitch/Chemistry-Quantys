from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import os
import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Draw
import base64

try:
    import umap
    HAS_UMAP = True
except ImportError:
    HAS_UMAP = False

try:
    from sklearn.decomposition import PCA
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

router = APIRouter()

# In-memory storage for MolSpace sessions
molspace_sessions = {}

class MapConfig(BaseModel):
    n_neighbors: int = 15
    min_dist: float = 0.1
    metric: str = "jaccard" # Recommended for fingerprints

def mol_to_svg(mol):
    if mol is None: return ""
    d2d = Draw.MolDraw2DSVG(200, 200)
    d2d.DrawMolecule(mol)
    d2d.FinishDrawing()
    return d2d.GetDrawingText()

@router.post("/upload-dataset")
async def upload_dataset_molspace(
    file: UploadFile = File(...)
):
    session_id = str(uuid.uuid4())
    content = await file.read()
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith('.sdf'):
            suppl = Chem.ForwardSDMolSupplier(io.BytesIO(content))
            data = []
            for mol in suppl:
                if mol:
                    d = {p: mol.GetProp(p) for p in mol.GetPropNames() if mol.HasProp(p)}
                    d['smiles'] = Chem.MolToSmiles(mol)
                    data.append(d)
            df = pd.DataFrame(data)
        else:
            raise HTTPException(status_code=400, detail="Unsupported format")

        # Basic Preprocessing
        smiles_col = next((c for c in df.columns if c.lower() == 'smiles'), 'smiles')
        if smiles_col not in df.columns:
            raise HTTPException(status_code=400, detail="Dataset must have SMILES column")
        
        # Validate and Canonicalize
        mols = []
        valid_indices = []
        for i, smiles in enumerate(df[smiles_col]):
            mol = Chem.MolFromSmiles(str(smiles))
            if mol:
                mols.append(mol)
                valid_indices.append(i)
        
        df = df.iloc[valid_indices].copy()
        df['canonical_smiles'] = [Chem.MolToSmiles(m) for m in mols]
        
        # Store session
        molspace_sessions[session_id] = {
            "df": df,
            "mols": mols,
            "status": "uploaded"
        }
        
        return {
            "session_id": session_id,
            "count": len(df),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-map/{session_id}")
async def generate_map(session_id: str, config: MapConfig):
    if session_id not in molspace_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = molspace_sessions[session_id]
    mols = session["mols"]
    df = session["df"]
    
    try:
        # 1. Compute Fingerprints
        fps = [AllChem.GetMorganFingerprintAsBitVect(m, 2, nBits=2048) for m in mols]
        X = np.array([list(fp) for fp in fps])
        
        # 2. Dimensionality Reduction
        if HAS_UMAP:
            reducer = umap.UMAP(
                n_neighbors=config.n_neighbors,
                min_dist=config.min_dist,
                metric=config.metric,
                random_state=42
            )
            embedding = reducer.fit_transform(X)
        elif HAS_SKLEARN:
            # Fallback to PCA if UMAP fails
            reducer = PCA(n_components=2)
            embedding = reducer.fit_transform(X)
        else:
            # Random mock coords
            embedding = np.random.rand(len(mols), 2) * 10
            
        # 3. Prepare data for frontend
        plot_data = []
        for i in range(len(embedding)):
            row = df.iloc[i]
            # Simple property extraction
            mw = Descriptors.MolWt(mols[i])
            logp = Descriptors.MolLogP(mols[i])
            
            plot_data.append({
                "id": i,
                "x": float(embedding[i, 0]),
                "y": float(embedding[i, 1]),
                "smiles": row['canonical_smiles'],
                "mw": mw,
                "logp": logp,
                "label": str(row.get('molecule_id', row.get('id', f'Mol_{i}')))
            })
            
        molspace_sessions[session_id]["plot_data"] = plot_data
        molspace_sessions[session_id]["status"] = "mapped"
        
        return {"status": "success", "points": plot_data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/molecule-info/{session_id}/{mol_index}")
async def get_molecule_info(session_id: str, mol_index: int):
    if session_id not in molspace_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = molspace_sessions[session_id]
    if mol_index >= len(session["mols"]):
        raise HTTPException(status_code=404, detail="Molecule index out of range")
        
    mol = session["mols"][mol_index]
    svg = mol_to_svg(mol)
    
    properties = {
        "Molecular Weight": round(Descriptors.MolWt(mol), 2),
        "LogP": round(Descriptors.MolLogP(mol), 2),
        "TPSA": round(Descriptors.TPSA(mol), 2),
        "H-Bond Donors": Descriptors.NumHDonors(mol),
        "H-Bond Acceptors": Descriptors.NumHAcceptors(mol),
        "Rotatable Bonds": Descriptors.NumRotatableBonds(mol)
    }
    
    return {
        "svg": svg,
        "properties": properties,
        "smiles": Chem.MolToSmiles(mol)
    }
