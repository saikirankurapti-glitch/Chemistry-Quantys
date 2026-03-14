import React, { useState } from 'react';
import MoleculeInput from '../components/MoleculeInput';
import MoleculeProperties from '../components/MoleculeProperties';
import MoleculeRenderer from '../components/MoleculeRenderer';
import ExperimentSetup from '../components/ExperimentSetup';
import GeneratedMolecules from '../components/GeneratedMolecules';
import RewardPanel from '../components/RewardPanel';
import OutputDashboard from '../components/OutputDashboard';
import { runGenerativeEnsemble, scoreMolecules, type ScoredMolecule } from '../services/api';

const Dashboard: React.FC = () => {
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
        // Reset molecules if running new experiment
        setGeneratedMolecules([]);
        setScoredMolecules([]);
    };

    const handleGenerate = async () => {
        if (!experimentId) return;
        setIsGenerating(true);
        setScoredMolecules([]); // clear previous scores
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

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                    Chemistry Core Engine
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    AI Drug Discovery Platform. Define target profile constraints and analyze valid seed molecules.
                </p>
            </div>

            <div className="flex flex-col space-y-12">
                {/* Experiment Setup Panel */}
                <section className="w-full">
                    <ExperimentSetup onExperimentStarted={handleExperimentStarted} />
                    {experimentId && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-md shadow-sm flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold">✓ Experiment Launched Successfully </span>
                                    <span className="text-sm ml-2 bg-green-200 px-2 py-1 rounded text-green-900">ID: {experimentId}</span>
                                </div>
                                <span className="text-sm font-semibold">{experimentMethod} Model Prepared</span>
                            </div>

                            <div className="mt-6 flex flex-col items-start pt-4 border-t border-green-200">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-md shadow transition disabled:opacity-50"
                                >
                                    {isGenerating ? 'Simulating Generative AI Models...' : 'Generate New Molecules'}
                                </button>
                            </div>
                        </div>
                    )}

                    <GeneratedMolecules molecules={generatedMolecules} />

                    {/* Step 3: Grade Generated AI Molecules */}
                    {generatedMolecules.length > 0 && (
                        <div className="mt-8 flex flex-col items-center">
                            <button
                                onClick={handleScore}
                                disabled={isScoring}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-md shadow-lg transition disabled:opacity-50"
                            >
                                {isScoring ? 'Calculating Multi-Parameter Reward Physics...' : 'Rank Candidates using Reward Engine'}
                            </button>
                        </div>
                    )}

                    {/* Final Output: Ranking */}
                    {scoredMolecules.length > 0 && experimentId && (
                        <>
                            <RewardPanel molecules={scoredMolecules} />
                            <OutputDashboard experimentId={experimentId} />
                        </>
                    )}
                </section>

                {/* Molecule Processing Panel - Only enabled conceptually after experiment configuration, but independent for UI demonstration */}
                <section className="w-full border-t border-gray-200 pt-10">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Generative Molecular Validation</h2>
                        <p className="text-sm text-gray-500">Test seed molecules against cheminformatics physics rules.</p>
                    </div>

                    <div className="flex justify-center w-full mb-8">
                        <div className="w-full max-w-2xl">
                            <MoleculeInput onMoleculeValid={handleValidMolecule} />
                        </div>
                    </div>

                    {activeSmiles && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full transition-all duration-500 ease-in-out pb-16">
                            <div className="w-full h-full flex flex-col">
                                <MoleculeRenderer smiles={activeSmiles} />
                            </div>
                            <div className="w-full h-full flex flex-col">
                                <MoleculeProperties smiles={activeSmiles} />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
