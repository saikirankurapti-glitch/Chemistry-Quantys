from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from backend.models.experiment_model import experiments_db
from backend.utils.chemistry_utils import validate_molecule
import random

router = APIRouter()

class GenerateRequest(BaseModel):
    experiment_id: str

class GenerateResponse(BaseModel):
    experiment_id: str
    generated_molecules: List[str]

@router.post("", response_model=GenerateResponse, summary="Generates candidate molecules using AI ensemble")
def generate_molecules(req: GenerateRequest):
    if req.experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment ID not found.")
        
    # Get config (could influence generation)
    config = experiments_db[req.experiment_id]
    
    # Step 3: GENERATIVE MODEL ENSEMBLE
    # Simulating Multi-Model AI Generation based on configuration Constraints
    
    # LSTM Generator candidates
    lstm_candidates = ["CCO", "CC(=O)Oc1ccccc1C(=O)O", "C1=CC=CC=C1", "INVALID_LSTM_SMILES_123"]
    # VAE Generator candidates
    vae_candidates = ["CCN(CC)O", "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", "C1CCCCC1", "CCO"] # Notice CCO is duplicate
    # Transformer Generator candidates
    transformer_candidates = ["CC(=O)NC1=CC=C(O)C=C1", "CC(C)(C)NCC(O)C1=CC(=C(C=C1)O)CO", "BAD_SMILES_TRANSFORMER"]
    
    # Pool all generated results
    raw_ensemble = lstm_candidates + vae_candidates + transformer_candidates
    
    # Step 4: MOLECULE VALIDATION
    # Step 5: DUPLICATE REMOVAL
    valid_candidates = set() # Using set removes duplicates
    for smiles in raw_ensemble:
        if validate_molecule(smiles):
            valid_candidates.add(smiles)
            
    final_molecules = list(valid_candidates)
    
    # Step 6: STORE RESULTS
    experiments_db[req.experiment_id]["generated_molecules"] = final_molecules
    
    return GenerateResponse(
        experiment_id=req.experiment_id,
        generated_molecules=final_molecules
    )
