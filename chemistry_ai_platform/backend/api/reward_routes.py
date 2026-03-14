from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from backend.models.experiment_model import experiments_db
from backend.services.property_service import calculate_properties
import random

router = APIRouter()

class RewardRequest(BaseModel):
    experiment_id: str

class ScoredMolecule(BaseModel):
    smiles: str
    score: float
    mw: float
    logp: float
    drug_likeness: float
    admet_score: float
    novelty_score: float
    binding_score: float

class RewardResponse(BaseModel):
    experiment_id: str
    ranked_molecules: List[ScoredMolecule]

@router.post("", response_model=RewardResponse, summary="Scores and ranks generated molecules")
def score_molecules(req: RewardRequest):
    if req.experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment ID not found.")
        
    experiment = experiments_db[req.experiment_id]
    generated_mols = experiment.get("generated_molecules", [])
    
    if not generated_mols:
        raise HTTPException(status_code=400, detail="No generated molecules found for this experiment.")
        
    scored_results = []
    
    # Simple known dataset for step 5 novelty check
    known_dataset = {"CCO", "C1CCCCC1", "c1ccccc1"}
    
    for smiles in generated_mols:
        props = calculate_properties(smiles)
        if not props:
            continue
            
        mw = props.get("MolecularWeight", 0)
        logp = props.get("LogP", 0)
        hbd = props.get("HydrogenBondDonors", 0)
        hba = props.get("HydrogenBondAcceptors", 0)
        
        # Step 3: Drug Likeness Score (0 to 1) based on Lipinski's Rule of Five
        violations = 0
        if mw >= 500: violations += 1
        if logp >= 5: violations += 1
        if hbd > 5: violations += 1
        if hba > 10: violations += 1
        
        target_drug_likeness = max(0.0, 1.0 - (violations * 0.25))
        
        # Step 4: ADMET Prediction (Heuristics)
        # Toxicity, Solubility, Metabolism based on LogP and MW
        admet_score = 1.0
        if logp > 3: admet_score -= 0.2 # Lower solubility
        if mw > 400: admet_score -= 0.2 # Harder metabolism
        if hbd > 3: admet_score -= 0.1 # Potential toxicity issues
        admet_score = max(0.1, admet_score)
        
        # Step 5: Novelty Score
        novelty_score = 0.1 if smiles in known_dataset else 0.95
        
        # Step 6: Binding Potential
        # Estimating binding score correlates with HBD/HBA interactions
        binding_score = min(1.0, (hbd + hba) / 10.0 + random.uniform(0.1, 0.3))
        
        # Step 7: Final Score
        final_score = (0.35 * target_drug_likeness) + (0.30 * admet_score) + (0.20 * novelty_score) + (0.15 * binding_score)
        
        scored_results.append(ScoredMolecule(
            smiles=smiles,
            score=round(final_score, 4),
            mw=round(mw, 2),
            logp=round(logp, 2),
            drug_likeness=round(target_drug_likeness, 2),
            admet_score=round(admet_score, 2),
            novelty_score=round(novelty_score, 2),
            binding_score=round(binding_score, 2)
        ))
        
    # Step 8: Rank Molecules (highest to lowest)
    scored_results.sort(key=lambda x: x.score, reverse=True)
    
    # Step 9: Store Results
    experiment["ranked_molecules"] = [m.model_dump() for m in scored_results]
    
    return RewardResponse(
        experiment_id=req.experiment_id,
        ranked_molecules=scored_results
    )
