from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uuid
import os
import random
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from rdkit import Chem
from rdkit.Chem import AllChem

router = APIRouter()

# In-memory storage for PACE extraction jobs
pace_jobs: Dict[str, Any] = {}

class SARRow(BaseModel):
    compound_id: str
    smiles: str
    activity_type: str  # IC50, Ki, etc.
    activity_value: float
    unit: str

@router.post("/upload-patent")
async def upload_patent(
    file: UploadFile = File(...),
    extract_sar: bool = Form(True),
    extract_structures: bool = Form(True)
):
    job_id = str(uuid.uuid4())
    filename = file.filename
    
    pace_jobs[job_id] = {
        "job_id": job_id,
        "status": "processing",
        "filename": filename,
        "progress": 10,
        "timestamp": datetime.utcnow().isoformat(),
        "results_molecules": [],
        "sar_table": []
    }
    
    return {"job_id": job_id, "status": "Upload successful, processing started."}

@router.post("/extract-structures/{job_id}")
async def trigger_structure_extraction(job_id: str):
    if job_id not in pace_jobs:
        raise HTTPException(status_code=404, detail="Job ID not found")
    
    try:
        from rdkit.Chem import Descriptors
        # Mocking structure extraction logic
        mock_smiles = [
            "Cc1cc(Nc2cc(C(F)(F)F)cc(Nc3cccc(S(=O)(=O)N)c3)n2)ccn1",
            "CN1CCN(c2cc3nc(Nc4ccc(C)cc4)nc(Nc5cccc(S(N)(=O)=O)c5)c3cc2C)CC1",
            "CC(C)c1cc(Nc2nc(Nc3ccc(C)cc3)nc(Nc4cccc(S(N)(=O)=O)c4)n2)cc(C(C)C)c1"
        ]
        
        molecules = []
        short_id = job_id[:4]
        for i, smiles in enumerate(mock_smiles):
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                molecules.append({
                    "mol_id": f"PAT-{short_id}-{i+1}",
                    "smiles": smiles,
                    "mw": float(round(Descriptors.MolWt(mol), 2)),
                    "logp": float(round(Descriptors.MolLogP(mol), 2))
                })
                
        pace_jobs[job_id]["results_molecules"] = molecules
        pace_jobs[job_id]["progress"] = 50
        print(f"DEBUG: Extracted {len(molecules)} molecules")
        return {"status": "Success", "extracted_count": len(molecules)}
    except Exception as e:
        print(f"DEBUG: ERROR in structure extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-sar/{job_id}")
async def trigger_sar_extraction(job_id: str):
    if job_id not in pace_jobs:
        raise HTTPException(status_code=404, detail="Job ID not found")
        
    # Mocking SAR table extraction from patent tables
    job = pace_jobs[job_id]
    extracted_mols = job.get("results_molecules", [])
    
    sar_table = []
    for mol in extracted_mols:
        sar_table.append({
            "compound_id": str(mol["mol_id"]),
            "smiles": str(mol["smiles"]),
            "activity_type": "IC50",
            "activity_value": round(float(random.uniform(0.1, 500.0)), 2),
            "unit": "nM"
        })
        
    pace_jobs[job_id]["sar_table"] = sar_table
    pace_jobs[job_id]["status"] = "completed"
    pace_jobs[job_id]["progress"] = 100
    return {"status": "Complete", "rows_extracted": len(sar_table)}

@router.get("/results/{job_id}")
async def get_pace_results(job_id: str):
    if job_id not in pace_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = pace_jobs[job_id]
    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "filename": job["filename"],
        "progress": job["progress"],
        "molecules": job.get("results_molecules", []),
        "sar_table": job.get("sar_table", []),
        "metadata": {
            "p_date": "2024-03-12",
            "assignee": "Genentech, Inc.",
            "inventors": ["John Doe", "Jane Smith"],
            "classification": "A61K 31/00"
        }
    }
