from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy", "engine": "Chemistry Core Processing Engine"}

def test_validate_valid_smiles():
    res = client.post("/api/validate", json={"smiles": "CCO"})
    assert res.status_code == 200
    assert res.json()["is_valid"] == True

def test_validate_invalid_smiles():
    # Intentionally malformed validation test
    res = client.post("/api/validate", json={"smiles": "INVALID_X"})
    assert res.status_code == 200
    assert res.json()["is_valid"] == False

def test_properties():
    res = client.post("/api/properties", json={"smiles": "CCO"})
    assert res.status_code == 200
    props = res.json()["properties"]
    assert "mw" in props
    assert "logp" in props
    assert "tpsa" in props
    assert props["mw"] > 0

def test_drug_likeness():
    res = client.post("/api/drug-likeness", json={"smiles": "CCO"})
    assert res.status_code == 200
    assert res.json()["drug_like"] == True
    assert "violations" in res.json()

def test_convert_sdf():
    res = client.post("/api/convert", json={"smiles": "CCO", "target_format": "sdf"})
    assert res.status_code == 200
    assert res.json()["target_format"] == "SDF"
    assert "V2000" in res.json()["data"] or "V3000" in res.json()["data"]

def test_render():
    res = client.post("/api/render", json={"smiles": "c1ccccc1"})
    assert res.status_code == 200
    assert "image" in res.json()
    assert len(res.json()["image"]) > 100
