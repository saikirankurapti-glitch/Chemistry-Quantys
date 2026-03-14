# Generative Chemistry Engine

Welcome to the Generative Chemistry Engine, an AI drug discovery platform module. This system trains a generative model on molecular datasets (ZINC), generates novel SMILES strings, validates them using cheminformatics tools (RDKit), calculates drug-likeness (Rule of Five), and exposes an interactive FastAPI backend.

## Project Structure
```text
chemistry_ai_platform/
├── backend/
│   ├── app.py                  # FastAPI Backend application
│   ├── api/                    # API Routers (placeholder for expansion)
│   ├── services/               # Microservices (placeholder for expansion)
│   └── models/                 # API data models
├── ml_models/
│   ├── generative_model.py     # PyTorch LSTM Model
│   ├── train_model.py          # Training Loop
│   └── generate.py             # Molecule generation utility
├── datasets/
│   ├── prepare_dataset.py      # Download and clean ZINC dataset
│   └── encode_dataset.py       # Map SMILES to vocabulary IDs
├── utils/
│   ├── tokenizer.py            # Tokenization (SMILES -> Tokens)
│   └── chemistry_utils.py      # Molecule validation and visualization
├── experiments/                # Generated checkpoints
├── requirements.txt            # Python dependencies
├── setup_env.ps1               # Environment setup script
└── test_rdkit.py               # RDKit validation check
```

## Step-by-Step Execution Guide

### 1. Environment Setup
Run the environment setup script to initialize a virtual environment and install all dependencies including PyTorch and RDKit:
```powershell
.\setup_env.ps1
```
*(Ensure you are running inside a PowerShell terminal and bypass execution policy if necessary: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

### 2. Prepare the Dataset
We start by obtaining valid SMILES strings (from ZINC) for the Generative Model to learn from:
```powershell
python datasets/prepare_dataset.py
```
*Outputs: `datasets/clean_smiles.csv`*

### 3. Encode the Data
Next, convert the text strings into numeric sequences that PyTorch can digest:
```powershell
python datasets/encode_dataset.py
```
*Outputs: `datasets/vocab.json`, `datasets/encoded_smiles.pt`*

### 4. Train the Model
The LSTM network learns to predict the next token in a sequence (autoregressive generation).
```powershell
python ml_models/train_model.py
```
*Outputs: `experiments/generative_model_ckpt.pt`*

### 5. Run the API (Molecule Generation & Validation)
Launch the FastAPI server to access the generation endpoint:
```powershell
uvicorn backend.app:app --reload
```
Once the server is running, navigate to `http://127.0.0.1:8000/docs` to test the API interactively.

#### POST `/generate`
You can trigger molecule generation via this endpoint.
The pipeline automatically:
1. Feeds `<START>` into the generative model.
2. Samples SMILES tokens until `<END>`.
3. Passes the result to `RDKit` for valence/ring validation.
4. Calculates Molecular Weight, LogP, HBD, and HBA.
5. Applies Lipinski's Rule of Five to flag drug-likeness.
6. Encodes a 2D drawing of the molecule to a Base64 PNG.

**Enjoy exploring novel chemistry with AI!**
