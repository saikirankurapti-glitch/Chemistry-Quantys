import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface MoleculeValidation {
    smiles: string;
    is_valid: boolean;
    message: string;
}

export interface MoleculeProperties {
    mw: number;
    logp: number;
    hbd: number;
    hba: number;
    tpsa: number;
    rotatable_bonds: number;
}

export interface DrugLikeness {
    smiles: string;
    drug_like: boolean;
    violations: number;
}

export interface RenderedMolecule {
    smiles: string;
    image: string; // Base64 encoded string
}

export interface ExperimentRequest {
    method: string;
    binding_site: string;
    mandatory_interactions: string[];
    pharmacophore: string;
    anchor_points: string[];
    synthetic_feasibility: boolean;
    novelty: boolean;
}

export interface ExperimentResponse {
    experiment_id: string;
    status: string;
}

// ---- Existing Endpoints ---- //

export const validateMolecule = async (smiles: string): Promise<MoleculeValidation> => {
    const response = await api.post('/validate', { smiles });
    return response.data;
};

export const getMoleculeProperties = async (smiles: string): Promise<{ properties: MoleculeProperties }> => {
    const response = await api.post('/properties', { smiles });
    return response.data;
};

export const checkDrugLikeness = async (smiles: string): Promise<DrugLikeness> => {
    const response = await api.post('/drug-likeness', { smiles });
    return response.data;
};

export const renderMolecule = async (smiles: string): Promise<RenderedMolecule> => {
    const response = await api.post('/render', { smiles });
    return response.data;
};

// ---- New Experiment Endpoints ---- //

export const createExperiment = async (payload: ExperimentRequest): Promise<ExperimentResponse> => {
    const response = await api.post('/experiment/create', payload);
    return response.data;
};

// ---- Generative API Endpoint ---- //
export interface GenerateRequest {
    experiment_id: string;
}

export interface GenerateResponse {
    experiment_id: string;
    generated_molecules: string[];
}

export const runGenerativeEnsemble = async (experiment_id: string): Promise<GenerateResponse> => {
    // Uses the generic /api/generate string mapped in backend
    const response = await api.post('/generate', { experiment_id });
    return response.data;
};

// ---- Reward API Endpoint ---- //
export interface ScoredMolecule {
    smiles: string;
    score: number;
    mw: number;
    logp: number;
    drug_likeness: number;
}

export interface RewardResponse {
    experiment_id: string;
    ranked_molecules: ScoredMolecule[];
}

export const scoreMolecules = async (experiment_id: string): Promise<RewardResponse> => {
    const response = await api.post('/reward', { experiment_id });
    return response.data;
};

// ---- Output API Endpoints ---- //
export interface OutputMolecule {
    smiles: string;
    score: number;
    mw: number;
    logp: number;
    admet_score: number;
    drug_likeness: number;
    sdf_block: string;
    sar_x: number;
    sar_y: number;
}

export interface OutputResponse {
    experiment_id: string;
    molecules: OutputMolecule[];
}

export const getExperimentOutput = async (experiment_id: string): Promise<OutputResponse> => {
    const response = await api.get(`/output/${experiment_id}`);
    return response.data;
};

export const downloadURL = (experiment_id: string, format: string) => {
    return `${BASE_URL}/output/${experiment_id}/download?format=${format}`;
};
// ---- Alchemistry API Endpoints ---- //
export interface AlchemicalTransformation {
    ligand_a: string;
    ligand_b: string;
    dg: number;
    error: number;
    convergence: number;
}

export interface AlchemistryResults {
    experiment_id: string;
    protein_name: string;
    num_ligands: number;
    deltaG: number;
    confidence: number;
    transformations: AlchemicalTransformation[];
    snapshots: any[];
    status: string;
    timestamp: string;
}

export const runAlchemistry = async (protein: File, ligands: File): Promise<{ job_id: string, status?: string, message?: string }> => {
    const formData = new FormData();
    formData.append('protein_file', protein);
    formData.append('ligand_file', ligands);
    const response = await api.post('/alchemistry/run', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const getAlchemistryResults = async (jobId: string): Promise<AlchemistryResults> => {
    const response = await api.get(`/alchemistry/results/${jobId}`);
    return response.data;
};

export const getAlchemistryReport = async (jobId: string): Promise<any> => {
    const response = await api.get(`/alchemistry/report/${jobId}`);
    return response.data;
};

export const uploadLigands = async (file: File): Promise<{ filename: string, number_of_molecules: number, validation_status: string }> => {
    const formData = new FormData();
    formData.append('ligands', file);
    const response = await api.post('/alchemistry/upload-ligands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};
