import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import MoleculeInput from '../components/MoleculeInput';
import MoleculeProperties from '../components/MoleculeProperties';
import MoleculeRenderer from '../components/MoleculeRenderer';
import ExperimentSetup from '../components/ExperimentSetup';
import GeneratedMolecules from '../components/GeneratedMolecules';
import RewardPanel from '../components/RewardPanel';
import OutputDashboard from '../components/OutputDashboard';
import { runGenerativeEnsemble, scoreMolecules, type ScoredMolecule } from '../services/api';

const GenerativeChemistry: React.FC = () => {
    const navigate = useNavigate();

    const [activeSmiles, setActiveSmiles] = useState<string>('');
    const [experimentId, setExperimentId] = useState<string | null>(null);
    const [experimentMethod, setExperimentMethod] = useState<string | null>(null);
    const [generatedMolecules, setGeneratedMolecules] = useState<string[]>([]);
    const [scoredMolecules, setScoredMolecules] = useState<ScoredMolecule[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isScoring, setIsScoring] = useState<boolean>(false);

    const handleValidMolecule = (smiles: string) => {
        setActiveSmiles(smiles);
    };

    const handleExperimentStarted = (id: string, method: string) => {
        setExperimentId(id);
        setExperimentMethod(method);
        setGeneratedMolecules([]);
        setScoredMolecules([]);
        navigate('generation'); // proceed to next step automatically
    };

    const handleGenerate = async () => {
        if (!experimentId) return;
        setIsGenerating(true);
        setScoredMolecules([]); 
        try {
            const res = await runGenerativeEnsemble(experimentId);
            setGeneratedMolecules(res.generated_molecules);
        } catch (err) {
            console.error("Failed to generate ensemble molecules", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleScore = async () => {
        if (!experimentId) return;
        setIsScoring(true);
        try {
            const res = await scoreMolecules(experimentId);
            setScoredMolecules(res.ranked_molecules);
        } catch (err) {
            console.error("Failed to score molecules", err);
        } finally {
            setIsScoring(false);
        }
    };

    const tabs = [
        { name: 'Experiment Setup', path: 'experiment' },
        { name: 'Generative Ensemble', path: 'generation' },
        { name: 'Reward Engine', path: 'reward' },
        { name: 'Output & Analysis', path: 'output' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    Generative Chemistry
                </h1>
                <p className="text-gray-500 text-lg">
                    AI Drug Discovery Pipeline. Define target profile constraints and analyze novel generated molecules.
                </p>
            </div>

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            className={({ isActive }) =>
                                `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                    isActive
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`
                            }
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                <Routes>
                    <Route path="/" element={<Navigate to="experiment" replace />} />
                    
                    {/* Experiment Setup */}
                    <Route path="experiment" element={
                        <div className="flex flex-col space-y-8 animate-fade-in">
                            <ExperimentSetup onExperimentStarted={handleExperimentStarted} />
                            
                            {/* Validation panel at the bottom of experiment setup */}
                            <div className="border-t border-gray-200 pt-8 mt-8">
                                <div className="mb-6 text-center">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">Seed Molecule Validation</h2>
                                    <p className="text-sm text-gray-500">Test seed molecules against cheminformatics physics rules.</p>
                                </div>
                                <div className="flex justify-center w-full mb-8">
                                    <div className="w-full max-w-2xl">
                                        <MoleculeInput onMoleculeValid={handleValidMolecule} />
                                    </div>
                                </div>
                                {activeSmiles && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
                                        <div className="w-full h-full flex flex-col">
                                            <MoleculeRenderer smiles={activeSmiles} />
                                        </div>
                                        <div className="w-full h-full flex flex-col">
                                            <MoleculeProperties smiles={activeSmiles} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    } />

                    {/* Generative Ensemble */}
                    <Route path="generation" element={
                        <div className="flex flex-col space-y-6 animate-fade-in">
                            {!experimentId ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-gray-200 border-dashed">
                                    <p className="mb-4 text-lg">Experiment not initialized.</p>
                                    <button 
                                        onClick={() => navigate('/generative-chemistry/experiment')}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        &larr; Go back to Experiment Setup
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
                                        <div>
                                            <span className="font-semibold text-indigo-900 block text-sm mb-1">Active Experiment ID:</span>
                                            <span className="text-indigo-700 font-mono text-lg">{experimentId}</span>
                                            {experimentMethod && <span className="ml-3 text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">{experimentMethod} mode</span>}
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={isGenerating}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg shadow transition disabled:opacity-50"
                                        >
                                            {isGenerating ? 'Simulating Models...' : 'Generate Molecules'}
                                        </button>
                                    </div>
                                    
                                    {generatedMolecules.length > 0 ? (
                                        <div className="mt-4">
                                            <GeneratedMolecules molecules={generatedMolecules} />
                                            <div className="mt-8 flex justify-end">
                                                <button 
                                                    onClick={() => navigate('/generative-chemistry/reward')}
                                                    className="bg-white border-2 border-indigo-600 text-indigo-600 font-semibold py-2 px-6 rounded-lg hover:bg-indigo-50 transition"
                                                >
                                                    Continue to Reward Engine &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        !isGenerating && (
                                            <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-gray-100 border-dashed">
                                                Click "Generate Molecules" to start the ensemble.
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    } />

                    {/* Reward Engine */}
                    <Route path="reward" element={
                        <div className="flex flex-col space-y-6 animate-fade-in">
                            {!experimentId || generatedMolecules.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-gray-200 border-dashed">
                                    Please generate molecules first.
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center p-6 border-b border-gray-100 mb-4 bg-slate-50 rounded-t-xl">
                                        <button
                                            onClick={handleScore}
                                            disabled={isScoring}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isScoring ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Calculating Reward Physics...
                                                </>
                                            ) : (
                                                'Rank Candidates'
                                            )}
                                        </button>
                                    </div>
                                    
                                    {scoredMolecules.length > 0 ? (
                                        <div className="mt-2">
                                            <RewardPanel molecules={scoredMolecules} />
                                            <div className="mt-8 flex justify-end">
                                                <button 
                                                    onClick={() => navigate('/generative-chemistry/output')}
                                                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-2 px-6 rounded-lg hover:bg-teal-50 transition"
                                                >
                                                    View Final Output &rarr;
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        !isScoring && (
                                            <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border-2 border-gray-100 border-dashed">
                                                Click "Rank Candidates" to evaluate the generated molecules against target constraints.
                                            </div>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    } />

                    {/* Output & Analysis */}
                    <Route path="output" element={
                        <div className="flex flex-col space-y-6 animate-fade-in">
                            {!experimentId || scoredMolecules.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-gray-200 border-dashed">
                                    Please complete the reward ranking first to see the analysis.
                                </div>
                            ) : (
                                <OutputDashboard experimentId={experimentId} />
                            )}
                        </div>
                    } />
                </Routes>
            </div>
        </div>
    );
};

export default GenerativeChemistry;
