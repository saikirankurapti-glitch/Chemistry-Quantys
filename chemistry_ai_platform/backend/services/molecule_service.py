from rdkit import Chem
from rdkit.Chem import AllChem

def parse_smiles(smiles: str) -> Chem.Mol:
    """
    Step 2: Convert SMILES to RDKit Mol object.
    Returns error (ValueError) if invalid.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES string: {smiles}")
    return mol

def convert_smiles_to_sdf(smiles: str) -> str:
    """
    Step 4: Convert SMILES to SDF format with 2D coordinates.
    """
    mol = parse_smiles(smiles)
    # Generate 2D coordinates for SDF
    AllChem.Compute2DCoords(mol)
    return Chem.MolToMolBlock(mol)

def convert_smiles_to_pdb(smiles: str) -> str:
    """
    Step 4: Convert SMILES to PDB format with 3D coordinates.
    """
    mol = parse_smiles(smiles)
    # Generate 3D coordinates
    mol = Chem.AddHs(mol)
    AllChem.EmbedMolecule(mol, randomSeed=42)
    AllChem.MMFFOptimizeMolecule(mol)
    return Chem.MolToPDBBlock(mol)

def convert_sdf_to_smiles(sdf_data: str) -> str:
    """Read an SDF block back to SMILES."""
    mol = Chem.MolFromMolBlock(sdf_data)
    if mol is None:
        raise ValueError("Invalid SDF format")
    return Chem.MolToSmiles(mol)
