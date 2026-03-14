import sys
import os

# Set roots
ROOT = r"c:\Users\ASUS\OneDrive\Desktop\Chemistry\chemistry_ai_platform"
sys.path.append(ROOT)

try:
    from backend.api import (
        molecule_routes,
        experiment_routes,
        generate_routes,
        reward_routes,
        output_routes,
        mdflow_routes,
        training_routes,
        retrosynthesis_routes,
        alchemistry_routes,
        nacho_routes,
        molspace_routes,
        pace_routes
    )
    print("Imports Success")
except Exception as e:
    import traceback
    traceback.print_exc()
