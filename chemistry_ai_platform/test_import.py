import sys
import os

# Project root
root = r"c:\Users\ASUS\OneDrive\Desktop\Chemistry\chemistry_ai_platform"
sys.path.append(root)

try:
    from backend.api import molecule_routes
    print("SUCCESS: Import backend.api worked")
except Exception as e:
    print(f"FAILURE: Import failed with error: {e}")
    print(f"Current sys.path: {sys.path}")
