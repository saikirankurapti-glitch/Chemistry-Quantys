import rdkit
from rdkit import Chem

print(f"RDKit Version: {rdkit.__version__}")
mol = Chem.MolFromSmiles("CCO")
if mol:
    print("Success: RDKit generated a molecule from SMILES 'CCO'")
else:
    print("Failed to generate molecule")
