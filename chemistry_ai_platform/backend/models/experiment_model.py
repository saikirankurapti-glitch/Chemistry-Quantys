from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class ExperimentRequest(BaseModel):
    method: str  # LBDD or SBDD
    binding_site: str
    mandatory_interactions: List[str]
    pharmacophore: str
    anchor_points: List[str]
    synthetic_feasibility: bool
    novelty: bool

class ExperimentResponse(BaseModel):
    experiment_id: str
    timestamp: str
    status: str
    message: str

# In-memory storage for experiments
experiments_db = {}
