from fastapi import APIRouter, HTTPException
from backend.models.molecule_model import MoleculeRequest, ValidationResponse, PropertyResponse, LipinskiResponse, ConversionRequest, ConversionResponse
from backend.services import molecule_service, property_service
from backend.utils import chemistry_utils

router = APIRouter()

@router.post("/validate", response_model=ValidationResponse, summary="Validate a molecule")
def validate(req: MoleculeRequest):
    """Step 3: Expose validation endpoint."""
    is_valid = chemistry_utils.validate_molecule(req.smiles)
    return ValidationResponse(
        smiles=req.smiles,
        is_valid=is_valid,
        message="Valid chemistry structure" if is_valid else "Invalid SMILES structure"
    )

@router.post("/properties", response_model=PropertyResponse, summary="Calculate chemical properties")
def get_properties(req: MoleculeRequest):
    """Step 5: Expose property calculation endpoint."""
    if not chemistry_utils.validate_molecule(req.smiles):
        raise HTTPException(status_code=400, detail="Invalid SMILES structure")
        
    try:
        props = property_service.calculate_properties(req.smiles)
        return PropertyResponse(smiles=req.smiles, properties=props)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/drug-likeness", response_model=LipinskiResponse, summary="Check Lipinski's Rule of Five")
def check_drug_likeness(req: MoleculeRequest):
    """Step 6: Expose Lipinski validation."""
    if not chemistry_utils.validate_molecule(req.smiles):
        raise HTTPException(status_code=400, detail="Invalid SMILES structure")
        
    try:
        props = property_service.calculate_properties(req.smiles)
        lipinski = property_service.check_lipinski(props)
        return LipinskiResponse(smiles=req.smiles, **lipinski)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/render", summary="Render 2D visualization of molecule")
def render(req: MoleculeRequest):
    """Step 7: Expose image generation as Base64."""
    try:
        img_b64 = chemistry_utils.render_molecule(req.smiles)
        return {"smiles": req.smiles, "image": img_b64}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/convert", response_model=ConversionResponse, summary="Convert between formats")
def convert(req: ConversionRequest):
    """Step 4: Expose conversions between SMILES, SDF, and PDB formats."""
    try:
        fmt = req.target_format.lower()
        if fmt == "sdf":
            data = molecule_service.convert_smiles_to_sdf(req.smiles)
        elif fmt == "pdb":
            data = molecule_service.convert_smiles_to_pdb(req.smiles)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format '{req.target_format}'. Supported formats: SDF, PDB.")
            
        return ConversionResponse(
            smiles=req.smiles, 
            target_format=req.target_format.upper(), 
            data=data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
