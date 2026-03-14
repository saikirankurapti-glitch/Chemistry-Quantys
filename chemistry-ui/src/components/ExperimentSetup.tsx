import React, { useState } from 'react';
import { createExperiment, type ExperimentRequest } from '../services/api';

interface Props {
    onExperimentStarted: (experimentId: string, method: string) => void;
}

const ExperimentSetup: React.FC<Props> = ({ onExperimentStarted }) => {
    const [method, setMethod] = useState<'LBDD' | 'SBDD'>('SBDD');
    const [bindingSite, setBindingSite] = useState('');
    const [mandatoryInteractions, setMandatoryInteractions] = useState('');
    const [pharmacophore, setPharmacophore] = useState('');
    const [anchorPoints, setAnchorPoints] = useState('');
    const [syntheticFeasibility, setSyntheticFeasibility] = useState(true);
    const [novelty, setNovelty] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Parse comma delimited strings into arrays as configured by the backend
        const interactionList = mandatoryInteractions.split(',').map(s => s.trim()).filter(s => s);
        const anchorList = anchorPoints.split(',').map(s => s.trim()).filter(s => s);

        const payload: ExperimentRequest = {
            method,
            binding_site: bindingSite,
            mandatory_interactions: interactionList,
            pharmacophore,
            anchor_points: anchorList,
            synthetic_feasibility: syntheticFeasibility,
            novelty,
        };

        try {
            const response = await createExperiment(payload);
            onExperimentStarted(response.experiment_id, method);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create experiment in backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-start min-h-[400px]">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Experiment Configuration</h2>
                <p className="text-sm text-gray-500">Define the drug discovery parameters before activating the AI Generator.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col space-y-6">

                {/* Method Selection */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-700 mb-2">Design Methodology</label>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${method === 'SBDD' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            onClick={() => setMethod('SBDD')}
                        >
                            Structure Based (SBDD)
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors ${method === 'LBDD' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            onClick={() => setMethod('LBDD')}
                        >
                            Ligand Based (LBDD)
                        </button>
                    </div>
                </div>

                {/* Dynamic Fields - based on method or generally applied */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Binding Site</label>
                        <input
                            required
                            className="text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. ATP pocket"
                            value={bindingSite}
                            onChange={(e) => setBindingSite(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Pharmacophore</label>
                        <input
                            required
                            className="text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. aromatic ring + hydrogen donor"
                            value={pharmacophore}
                            onChange={(e) => setPharmacophore(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Mandatory Interactions (comma separated)</label>
                        <input
                            className="text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. H-bond with Lys72, Pi-stacking with Phe81"
                            value={mandatoryInteractions}
                            onChange={(e) => setMandatoryInteractions(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600 uppercase mb-1">Anchor Points (comma separated)</label>
                        <input
                            className="text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. hydrophobic pocket"
                            value={anchorPoints}
                            onChange={(e) => setAnchorPoints(e.target.value)}
                        />
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex space-x-6 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={syntheticFeasibility}
                            onChange={(e) => setSyntheticFeasibility(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Require Synthetic Feasibility</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={novelty}
                            onChange={(e) => setNovelty(e.target.checked)}
                        />
                        <span className="text-sm text-gray-700">Enforce Strict Novelty</span>
                    </label>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 transition mt-4 disabled:opacity-50"
                >
                    {loading ? 'Initializing Experiment...' : 'Start Experiment Configuration'}
                </button>
            </form>
        </div>
    );
};

export default ExperimentSetup;
