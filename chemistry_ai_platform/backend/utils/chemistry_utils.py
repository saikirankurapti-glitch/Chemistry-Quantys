from rdkit import Chem
from rdkit.Chem import Draw
import io
import base64

def validate_molecule(smiles: str) -> bool:
    """
    Step 3: Molecule Validation
    Checks SMILES format validity and structural integrity.
    """
    try:
        # MolFromSmiles checks basic chemical rules around valence & syntax
        mol = Chem.MolFromSmiles(smiles)
        return mol is not None and mol.GetNumAtoms() > 0
    except Exception:
        return False

def render_molecule(smiles: str) -> str:
    """
    Step 7: Molecule Visualization
    Draws a 2D molecule representation and returns it as a Base64 encoded PNG.
    """
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise ValueError(f"Invalid SMILES string: {smiles}")
        
    img = Draw.MolToImage(mol, size=(400, 400))
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str
