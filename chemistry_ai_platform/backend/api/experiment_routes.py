from fastapi import APIRouter, HTTPException
from backend.models.experiment_model import ExperimentRequest, ExperimentResponse, experiments_db
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/create", response_model=ExperimentResponse, summary="Create a new drug discovery experiment")
def create_experiment(req: ExperimentRequest):
    """
    Step 3: Experiment Backend API
    Stores the configuration for LBDD/SBDD drug design and returns an ID.
    """
    if req.method not in ["LBDD", "SBDD"]:
        raise HTTPException(status_code=400, detail="Method must be LBDD or SBDD")

    exp_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()

    # Store experiment in memory
    experiment_data = {
        "experiment_id": exp_id,
        "method": req.method,
        "constraints": {
            "binding_site": req.binding_site,
            "mandatory_interactions": req.mandatory_interactions,
            "pharmacophore": req.pharmacophore,
            "anchor_points": req.anchor_points,
            "synthetic_feasibility": req.synthetic_feasibility,
            "novelty": req.novelty
        },
        "timestamp": timestamp
    }
    
    experiments_db[exp_id] = experiment_data
    
    return ExperimentResponse(
        experiment_id=exp_id,
        timestamp=timestamp,
        status="success",
        message=f"Experiment {req.method} successfully registered."
    )

@router.get("/{experiment_id}", summary="Retrieve experiment configuration")
def get_experiment(experiment_id: str):
    """Retrieve an existing experiment configuration by ID."""
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    return experiments_db[experiment_id]
