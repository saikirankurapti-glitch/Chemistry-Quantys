from pydantic import BaseModel
from typing import Optional, Dict

class MoleculeRequest(BaseModel):
    smiles: str

class ValidationResponse(BaseModel):
    smiles: str
    is_valid: bool
    message: str

class PropertyResponse(BaseModel):
    smiles: str
    properties: Dict[str, float]

class LipinskiResponse(BaseModel):
    smiles: str
    drug_like: bool
    violations: int

class ConversionRequest(BaseModel):
    smiles: str
    target_format: str

class ConversionResponse(BaseModel):
    smiles: str
    target_format: str
    data: str
