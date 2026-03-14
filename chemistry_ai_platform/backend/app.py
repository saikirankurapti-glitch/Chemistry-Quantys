from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Allow Python to import from project root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

app = FastAPI(
    title="Chemistry Core Engine API",
    version="1.0.0",
    description="Backend API for AI Drug Discovery Platform"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(molecule_routes.router, prefix="/api", tags=["Molecules"])
app.include_router(experiment_routes.router, prefix="/api/experiment", tags=["Experiments"])
app.include_router(generate_routes.router, prefix="/api/generate", tags=["Generative AI"])
app.include_router(reward_routes.router, prefix="/api/reward", tags=["Reward System"])
app.include_router(output_routes.router, prefix="/api/output", tags=["Output Analytics"])
app.include_router(mdflow_routes.router, prefix="/api/mdflow", tags=["MDFlow Engine"])
app.include_router(training_routes.router, prefix="/api/model-training", tags=["Model Training"])
app.include_router(retrosynthesis_routes.router, prefix="/api/retrosynthesis", tags=["Retrosynthesis"])
app.include_router(alchemistry_routes.router, prefix="/api/alchemistry", tags=["Alchemistry"])
app.include_router(nacho_routes.router, prefix="/api/nacho", tags=["Nacho01 Foundation"])
app.include_router(molspace_routes.router, prefix="/api/molspace", tags=["MolSpace Visualization"])
app.include_router(pace_routes.router, prefix="/api/pace", tags=["Patent Extraction"])


@app.get("/")
def read_root():
    """Root endpoint to confirm API is running."""
    return {
        "message": "Chemistry Core Engine API is running.",
        "documentation": "/docs",
        "health": "/health",
        "status": "ready"
    }


@app.get("/health")
def health_check():
    """Health check endpoint for the API."""
    return {
        "status": "healthy",
        "engine": "Chemistry Core Processing Engine"
    }


if __name__ == "__main__":
    import uvicorn
    # Use string format for reload to work correctly
    uvicorn.run("backend.app:app", host="0.0.0.0", port=8000, reload=True)