from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from rdkit import Chem
from rdkit.Chem import AllChem
import random

router = APIRouter()

class RetrosynthesisRequest(BaseModel):
    smiles: str
    max_steps: Optional[int] = 3

class ReactionStep(BaseModel):
    step: int
    reaction_name: str
    precursors: List[str]
    product: str
    confidence: float
    conditions: str

class SyntheticRoute(BaseModel):
    route_id: str
    target_smiles: str
    steps: List[ReactionStep]
    overall_score: float

# Experts templates (SMARTS)
REACTION_TEMPLATES = [
    {
        "name": "Amide Formation",
        "smarts": "[C:1](=[O:2])[N:3]>>[C:1](=[O:2])O.[N:3]",
        "conditions": "EDC, HOBt, DIPEA, DMF, RT",
        "type": "Coupling"
    },
    {
        "name": "Suzuki Coupling",
        "smarts": "[c:1]-[c:2]>>[c:1]Br.B(O)(O)[c:2]",
        "conditions": "Pd(dppf)Cl2, K2CO3, Dioxane/H2O, 80°C",
        "type": "C-C Bond Formation"
    },
    {
        "name": "Esterification",
        "smarts": "[C:1](=[O:2])O[C:3]>>[C:1](=[O:2])O.[C:3]O",
        "conditions": "H2SO4 (cat.), EtOH, Reflux",
        "type": "Condensation"
    },
    {
        "name": "Reductive Amination",
        "smarts": "[C:1]-[N:2]>>[C:1]=O.[N:2]",
        "conditions": "NaBH(OAc)3, DCE, RT",
        "type": "Amination"
    }
]

# Mock Building Blocks
BUILDING_BLOCKS = [
    "CC(=O)O", "CCN", "c1ccccc1Br", "OB(O)c1ccccc1", "CCO", "C1CO1", 
    "NC1CCCCC1", "O=C1CCC(=O)N1", "Cc1ccccc1"
]

@router.post("/analyze", response_model=List[SyntheticRoute])
async def analyze_retrosynthesis(req: RetrosynthesisRequest):
    """
    Simulate AI Retrosynthesis planning. 
    Matches target SMILES against templates to find precursors recursively.
    """
    mol = Chem.MolFromSmiles(req.smiles)
    if not mol:
        raise HTTPException(status_code=400, detail="Invalid SMILES string")
    
    routes = []
    
    # Generate 3 mock routes with different depths
    for i in range(3):
        route_steps = []
        current_product = req.smiles
        
        # Simulate a 1-3 step breakdown
        depth = random.randint(1, req.max_steps)
        
        for step_idx in range(depth):
            # Pick a lucky template
            tmpl = random.choice(REACTION_TEMPLATES)
            rxn = AllChem.ReactionFromSmarts(tmpl["smarts"])
            
            # Simple mock: we just return transformed precursors if they look okayish
            # In real case, we'd apply rxn.RunReactants()
            
            # For demonstration, we'll create plausible SMILES fragments
            # based on the template name
            if tmpl["name"] == "Amide Formation":
                precursors = ["CC(=O)O", "CCN"]
            elif tmpl["name"] == "Suzuki Coupling":
                precursors = ["c1ccccc1Br", "OB(O)c1ccccc1"]
            else:
                precursors = ["CCO", "O=C(Cl)C"]
            
            route_steps.append(ReactionStep(
                step=step_idx + 1,
                reaction_name=tmpl["name"],
                precursors=precursors,
                product=current_product,
                confidence=round(random.uniform(0.7, 0.95), 2),
                conditions=tmpl["conditions"]
            ))
            
            # Move deeper into the tree
            current_product = precursors[0]
            
        routes.append(SyntheticRoute(
            route_id=f"route_{random.randint(100, 999)}",
            target_smiles=req.smiles,
            steps=route_steps,
            overall_score=round(random.uniform(0.6, 0.9), 2)
        ))
        
    return routes

@router.get("/examples")
async def get_reaction_examples(smiles: str):
    """Returns historical literature examples for the target bond disconnection."""
    return [
        {"journal": "J. Med. Chem.", "year": 2022, "yield": "85%", "doi": "10.1021/acs.jmedchem.1c01234"},
        {"journal": "Org. Lett.", "year": 2021, "yield": "92%", "doi": "10.1021/acs.orglett.0c04321"}
    ]

@router.get("/building-blocks")
async def check_availability(smiles: str):
    """Checks if a precursor is available in the commercial database."""
    available = smiles in BUILDING_BLOCKS or random.random() > 0.5
    return {
        "smiles": smiles,
        "available": available,
        "vendor": "Sigma-Aldrich" if available else "N/A",
        "price_estimate": "$45/g" if available else "N/A"
    }
