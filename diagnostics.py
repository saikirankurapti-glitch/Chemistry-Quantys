import sys
import os

try:
    import rdkit
    from rdkit import Chem
    print(f"RDKit Version: {rdkit.__version__}")
except Exception as e:
    print(f"RDKit Import Failed: {e}")

try:
    import torch
    print(f"Torch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
except Exception as e:
    print(f"Torch Import Failed: {e}")

try:
    import numpy
    print(f"Numpy Version: {numpy.__version__}")
except Exception as e:
    print(f"Numpy Import Failed: {e}")

try:
    from fastapi import FastAPI
    print("FastAPI Import OK")
except Exception as e:
    print(f"FastAPI Import Failed: {e}")
