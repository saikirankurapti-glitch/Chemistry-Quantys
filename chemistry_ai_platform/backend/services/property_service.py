from rdkit.Chem import Descriptors, Lipinski
from backend.services.molecule_service import parse_smiles

def calculate_properties(smiles: str) -> dict:
    """
    Step 5: Calculate properties.
    MW, LogP, HBD, HBA, TPSA, Rotatable Bonds.
    """
    mol = parse_smiles(smiles)
    
    return {
        "mw": round(Descriptors.MolWt(mol), 2),
        "logp": round(Descriptors.MolLogP(mol), 2),
        "hbd": Lipinski.NumHDonors(mol),
        "hba": Lipinski.NumHAcceptors(mol),
        "tpsa": round(Descriptors.TPSA(mol), 2),
        "rotatable_bonds": Descriptors.NumRotatableBonds(mol)
    }

def check_lipinski(props: dict) -> dict:
    """
    Step 6: Lipinski Drug-Likeness Check
    MW < 500, LogP < 5, HBD < 5, HBA < 10
    """
    violations = 0
    if props["mw"] >= 500: violations += 1
    if props["logp"] >= 5: violations += 1
    if props["hbd"] >= 5: violations += 1
    if props["hba"] >= 10: violations += 1
    
    # Typically, a molecule is drug-like if it has <= 1 violation of Lipinski rules
    return {
        "drug_like": violations <= 1,
        "violations": violations
    }
