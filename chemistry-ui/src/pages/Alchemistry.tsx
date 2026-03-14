import React, { useState } from 'react';
import ProteinUploadPanel from '../components/alchemistry/ProteinUploadPanel';
import LigandUploadPanel from '../components/alchemistry/LigandUploadPanel';
import TopologyPreparationPanel from '../components/alchemistry/TopologyPreparationPanel';
import SimulationEnginePanel from '../components/alchemistry/SimulationEnginePanel';
import ResultsPanel from '../components/alchemistry/ResultsPanel';
import { runAlchemistry, getAlchemistryResults, uploadLigands, api, type AlchemistryResults } from '../services/api';
import { Beaker } from 'lucide-react';

const Alchemistry: React.FC = () => {
    const [protein, setProtein] = useState<File | null>(null);
    const [ligands, setLigands] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<AlchemistryResults | null>(null);
    const [phase, setPhase] = useState<'upload' | 'prep' | 'sim' | 'results'>('upload');
    const [ligandStats, setLigandStats] = useState<{ number_of_molecules: number, validation_status: string } | null>(null);

    const handleLigandFileChange = async (file: File | null) => {
        setLigands(file);
        if (file) {
            try {
                const stats = await uploadLigands(file);
                setLigandStats(stats);
            } catch (err) {
                console.error("Failed to validate ligands", err);
                setLigandStats({ number_of_molecules: 0, validation_status: "Error" });
            }
        } else {
            setLigandStats(null);
        }
    };

    const checkBackend = async () => {
        try {
            const res = await api.get('/alchemistry/ping');
            alert(`Backend alive! OpenMM: ${res.data.has_openmm ? 'Yes' : 'No (Using Fallback)'}`);
        } catch (err) {
            alert('Cannot reach Alchemistry backend. Check if FastAPI is running on port 8000.');
        }
    };

    const handleRun = async () => {
        if (!protein || !ligands) return;
        
        setIsProcessing(true);
        setPhase('prep');
        
        try {
            const response = await runAlchemistry(protein, ligands);
            
            if (response.status === 'error') {
                throw new Error(response.message || 'Unknown backend error');
            }

            const { job_id } = response;
            
            // Artificial delay to show prep phase
            setTimeout(() => {
                setPhase('sim');
                
                // Artificial delay to show simulation phase
                setTimeout(async () => {
                    const data = await getAlchemistryResults(job_id);
                    setResults(data);
                    setPhase('results');
                    setIsProcessing(false);
                }, 4000);
            }, 3000);
            
        } catch (err: any) {
            console.error("Alchemistry failed:", err);
            setIsProcessing(false);
            setPhase('upload');
            
            const errorMsg = err.response?.data?.message || err.message || "Unknown computation error";
            alert(`Calculation failed: ${errorMsg}\n\nPlease check your input files or backend logs for details.`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
            <div className="mb-12">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-rose-200">
                            <Beaker size={28} />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Alchemistry <span className="text-rose-600">Engine</span>
                        </h1>
                    </div>
                    <button 
                        onClick={checkBackend}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm"
                    >
                        Check System Status
                    </button>
                </div>
                <p className="text-slate-500 text-lg max-w-2xl font-medium">
                    Relative binding free energy (ΔG) via alchemical perturbations. High-precision lead optimization using the OpenMM physics engine.
                </p>
            </div>

            <div className="space-y-12">
                {/* 1. Upload Section */}
                {phase === 'upload' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <ProteinUploadPanel file={protein} setFile={setProtein} />
                        <LigandUploadPanel file={ligands} setFile={handleLigandFileChange} stats={ligandStats} />
                        
                        <div className="md:col-span-2 flex justify-center mt-4">
                            <button 
                                onClick={handleRun}
                                disabled={!protein || !ligands || isProcessing}
                                className="bg-slate-900 hover:bg-black text-white font-black px-12 py-5 rounded-2xl shadow-2xl shadow-slate-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-4 text-lg"
                            >
                                <Beaker size={24} /> Start Alchemical Pipeline
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. Intermediate Phases */}
                {(phase === 'prep' || phase === 'sim') && (
                    <div className="space-y-12">
                        <TopologyPreparationPanel isVisible={true} isProcessing={phase === 'prep'} />
                        <SimulationEnginePanel isSimulating={phase === 'sim'} />
                    </div>
                )}

                {/* 3. Final Results */}
                {phase === 'results' && results && (
                    <ResultsPanel results={results} />
                )}
            </div>
        </div>
    );
};

export default Alchemistry;
