from rdkit import Chem
from rdkit.Chem import Descriptors, Lipinski, Draw
from typing import Dict, Optional, Tuple, Any
import io
import base64

def check_chemical_validity(smiles: str) -> bool:
    """
    Step 8: Molecule Validation
    How RDKit checks validity:
    When Chem.MolFromSmiles is called, RDKit attempts to parse the SMILES string into an internal graph representation.
    During parsing, it checks:
    1. Syntax (balanced parentheses, valid element symbols).
    2. Valence rules (e.g., Carbon cannot have 6 bonds).
    3. Ring closures (matching numbers for ring structures).
    If any rule is broken, RDKit returns None.
    """
    try:
        mol = Chem.MolFromSmiles(smiles)
        return mol is not None
    except:
        return False

def calculate_properties(smiles: str) -> Optional[Dict[str, float]]:
    """
    Step 9: Calculate molecular properties (MW, LogP, HBD, HBA)
    """
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return None
        
    return {
        "MolecularWeight": Descriptors.MolWt(mol),
        "LogP": Descriptors.MolLogP(mol),
        "HydrogenBondDonors": Lipinski.NumHDonors(mol),
        "HydrogenBondAcceptors": Lipinski.NumHAcceptors(mol)
    }

def filter_rule_of_five(props: Dict[str, float]) -> bool:
    """
    Step 9: Apply Lipinski's Rule of Five
    A drug candidate generally should have:
    - MW < 500 Da
    - LogP < 5
    - H-bond donors <= 5
    - H-bond acceptors <= 10
    """
    if props is None:
        return False
        
    violations = 0
    if props["MolecularWeight"] >= 500: violations += 1
    if props["LogP"] >= 5: violations += 1
    if props["HydrogenBondDonors"] > 5: violations += 1
    if props["HydrogenBondAcceptors"] > 10: violations += 1
    
    # Commonly, <= 1 violation is considered acceptable, but we can be strict (0).
    return violations <= 1

def validate_and_filter(smiles: str) -> Tuple[bool, bool, Optional[Dict]]:
    """
    Validates a molecule and applies Rule of 5.
    Returns: (is_valid, is_drug_like, properties_dict)
    """
    if not check_chemical_validity(smiles):
        return False, False, None
        
    props = calculate_properties(smiles)
    is_drug_like = filter_rule_of_five(props)
    
    return True, is_drug_like, props

def render_molecule(smiles: str) -> str:
    """
    Step 10: Molecule Visualization
    Generates a 2D structure image and returns it as a Base64 encoded PNG string.
    """
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return ""
        
    # Generate image
    img = Draw.MolToImage(mol, size=(300, 300))
    
    # Save to bytes buffer
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    
    # Encode as Base64 to serve over API
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str
