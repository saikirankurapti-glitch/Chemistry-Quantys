from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class AlchemicalTransformation(BaseModel):
    ligand_a: str
    ligand_b: str
    dg: float
    error: float
    convergence: float

class AlchemistryResults(BaseModel):
    experiment_id: str
    protein_name: str
    num_ligands: int
    deltaG: float = 0.0
    confidence: float = 0.0
    transformations: List[AlchemicalTransformation]
    snapshots: List[Dict[str, float]]
    status: str
    timestamp: str

class AlchemistryJob(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str
