from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel
from typing import List, Any
import io
import csv
from backend.models.experiment_model import experiments_db
from rdkit import Chem
from rdkit.Chem import AllChem

try:
    from sklearn.manifold import TSNE
    from sklearn.decomposition import PCA
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

router = APIRouter()

class OutputMolecule(BaseModel):
    smiles: str
    score: float
    mw: float
    logp: float
    admet_score: float
    drug_likeness: float
    sdf_block: str
    sar_x: float
    sar_y: float

class OutputResponse(BaseModel):
    experiment_id: str
    molecules: List[OutputMolecule]

@router.get("/{experiment_id}", response_model=OutputResponse, summary="Get full output data for dashboard")
def get_experiment_output(experiment_id: str):
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment ID not found.")
        
    experiment = experiments_db[experiment_id]
    ranked_mols = experiment.get("ranked_molecules", [])
    
    if not ranked_mols:
        raise HTTPException(status_code=400, detail="No scored molecules available for output.")
        
    output_molecules = []
    fps = []
    
    # 1. Generate 3D SDF Blocks & Fingerprints
    for mol_data in ranked_mols:
        smiles = mol_data["smiles"]
        mol = Chem.MolFromSmiles(smiles)
        
        sdf_block = ""
        if mol:
            # 3D coordinates for viewer
            mol_3d = Chem.AddHs(mol)
            AllChem.EmbedMolecule(mol_3d, randomSeed=42)
            try:
                AllChem.MMFFOptimizeMolecule(mol_3d)
            except:
                pass
            sdf_block = Chem.MolToMolBlock(mol_3d)
            
            # Fingerprint for SAR clustering
            fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
            fps.append(list(fp))
        else:
            fps.append([0]*1024)
            
        output_molecules.append({
            "smiles": smiles,
            "score": mol_data.get("score", 0),
            "mw": mol_data.get("mw", 0),
            "logp": mol_data.get("logp", 0),
            "admet_score": mol_data.get("admet_score", 0),
            "drug_likeness": mol_data.get("drug_likeness", 0),
            "sdf_block": sdf_block,
            "sar_x": 0.0,
            "sar_y": 0.0
        })

    # 2. Run clustering (t-SNE/PCA)
    if HAS_SKLEARN and len(fps) >= 2:
        try:
            if len(fps) < 4:
                # Use PCA for very small dataset
                pca = PCA(n_components=2)
                coords = pca.fit_transform(fps)
            else:
                # Use t-SNE
                perplexity = min(30, len(fps) - 1)
                tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42)
                coords = tsne.fit_transform(fps)
                
            for i, point in enumerate(coords):
                output_molecules[i]["sar_x"] = float(point[0])
                output_molecules[i]["sar_y"] = float(point[1])
        except Exception as e:
            print(f"Clustering error: {e}")

    return OutputResponse(
        experiment_id=experiment_id,
        molecules=output_molecules
    )

@router.get("/{experiment_id}/download", summary="Download results in various formats")
def download_results(experiment_id: str, format: str = "csv"):
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment ID not found.")
        
    experiment = experiments_db[experiment_id]
    ranked_mols = experiment.get("ranked_molecules", [])
    
    if format.lower() == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["SMILES", "Score", "MW", "LogP", "ADMET_Score", "Drug_Likeness"])
        for m in ranked_mols:
            writer.writerow([m["smiles"], m.get("score"), m.get("mw"), m.get("logp"), m.get("admet_score"), m.get("drug_likeness")])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=results_{experiment_id}.csv"})

    elif format.lower() == "sdf":
        output = io.StringIO()
        for m in ranked_mols:
            mol = Chem.MolFromSmiles(m["smiles"])
            if mol:
                mol = Chem.AddHs(mol)
                AllChem.EmbedMolecule(mol, randomSeed=42)
                output.write(Chem.MolToMolBlock(mol))
                output.write("$$$$\\n")
        return Response(content=output.getvalue(), media_type="chemical/x-mdl-sdfile", headers={"Content-Disposition": f"attachment; filename=results_{experiment_id}.sdf"})
        
    else:
        # Default SMILES
        smiles_list = "\\n".join([m["smiles"] for m in ranked_mols])
        return PlainTextResponse(content=smiles_list, headers={"Content-Disposition": f"attachment; filename=results_{experiment_id}.smi"})
