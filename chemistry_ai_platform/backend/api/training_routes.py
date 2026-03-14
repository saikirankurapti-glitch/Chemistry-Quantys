from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import pandas as pd
import numpy as np
import io
import os
import uuid
import pickle
from typing import List, Optional
from pydantic import BaseModel
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score

router = APIRouter()

# In-memory storage for demo purposes
training_jobs = {}

class TrainingConfig(BaseModel):
    target_property: str
    model_type: str  # 'Random Forest', 'XGBoost', 'Neural Network'
    problem_type: str # 'regression', 'classification'

def calculate_descriptors(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return None
    
    return {
        "MW": Descriptors.MolWt(mol),
        "LogP": Descriptors.MolLogP(mol),
        "TPSA": Descriptors.TPSA(mol),
        "HBD": Descriptors.NumHDonors(mol),
        "HBA": Descriptors.NumHAcceptors(mol),
        "Rings": Descriptors.NumRotatableBonds(mol),
        "Fingerprint": list(AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024))
    }

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    target_property: str = Form(...)
):
    job_id = str(uuid.uuid4())
    content = await file.read()
    print(f"DEBUG: Received file {file.filename}, size {len(content)}, target {target_property}")
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
            print(f"DEBUG: CSV loaded, shape: {df.shape}")
        elif file.filename.endswith('.sdf'):
            # Proper SDF parsing with io.BytesIO
            sdf_stream = io.BytesIO(content)
            suppl = Chem.ForwardSDMolSupplier(sdf_stream)
            data = []
            for mol in suppl:
                if mol:
                    d = {prop: mol.GetProp(prop) for prop in mol.GetPropNames() if mol.HasProp(prop)}
                    d['smiles'] = Chem.MolToSmiles(mol)
                    data.append(d)
            df = pd.DataFrame(data)
            print(f"DEBUG: SDF loaded, count: {len(df)}")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Ensure smiles column exists (common names: smiles, SMILES, Smiles)
        smiles_col = next((c for c in df.columns if c.lower() == 'smiles'), None)
        if smiles_col and smiles_col != 'smiles':
            df = df.rename(columns={smiles_col: 'smiles'})
            print(f"DEBUG: Renamed {smiles_col} to smiles")

        if 'smiles' not in df.columns:
            print(f"DEBUG: Columns found: {df.columns.tolist()}")
            raise HTTPException(status_code=400, detail="Dataset must contain a 'smiles' column")

        if target_property not in df.columns:
            print(f"DEBUG: Target {target_property} not in {df.columns.tolist()}")
            raise HTTPException(status_code=400, detail=f"Target property '{target_property}' not found in dataset")

        # Basic Stats
        stats = {
            "total_molecules": len(df),
            "columns": list(df.columns),
            "target": target_property,
            "missing_values": int(df[target_property].isna().sum())
        }
        
        # Preprocessing (Mock)
        df_clean = df.dropna(subset=['smiles', target_property]).drop_duplicates(subset=['smiles'])
        
        training_jobs[job_id] = {
            "df": df_clean,
            "target": target_property,
            "stats": stats,
            "status": "ready"
        }
        
        return {"job_id": job_id, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/{job_id}")
async def train_model(job_id: str, config: TrainingConfig):
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = training_jobs[job_id]
    df = job["df"]
    target = config.target_property
    
    # 1. Featurization
    features = []
    labels = []
    
    for _, row in df.iterrows():
        desc = calculate_descriptors(row['smiles'])
        if desc:
            # Flatten descriptors + fingerprint
            feat_vec = [desc["MW"], desc["LogP"], desc["TPSA"], desc["HBD"], desc["HBA"], desc["Rings"]] + desc["Fingerprint"]
            features.append(feat_vec)
            labels.append(float(row[target]))
    
    X = np.array(features)
    y = np.array(labels)
    
    # 2. Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Train (Using Random Forest as default implementation)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 4. Evaluate
    y_pred = model.predict(X_test)
    metrics = {
        "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
        "mae": float(mean_absolute_error(y_test, y_pred)),
        "r2": float(r2_score(y_test, y_pred))
    }
    
    # Save model
    model_path = f"tmp_model_{job_id}.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    training_jobs[job_id].update({
        "metrics": metrics,
        "status": "completed",
        "model_path": model_path
    })
    
    return {"status": "success", "metrics": metrics}

@router.get("/download/{job_id}")
async def download_model(job_id: str):
    if job_id not in training_jobs or "model_path" not in training_jobs[job_id]:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return FileResponse(training_jobs[job_id]["model_path"], filename=f"model_{job_id}.pkl")
