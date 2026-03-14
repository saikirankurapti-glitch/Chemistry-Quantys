import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
try:
    from backend.api import generate_routes
    print("Success")
except Exception as e:
    print(f"Error: {e}")
