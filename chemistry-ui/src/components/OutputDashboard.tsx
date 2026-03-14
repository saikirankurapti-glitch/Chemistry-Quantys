import React, { useEffect, useState, useRef } from 'react';
import { getExperimentOutput, downloadURL, type OutputResponse, type OutputMolecule } from '../services/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// @ts-ignore
import * as $3Dmol from '3dmol/build/3Dmol.js';

interface Props {
    experimentId: string;
}

const OutputDashboard: React.FC<Props> = ({ experimentId }) => {
    const [data, setData] = useState<OutputResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeMol, setActiveMol] = useState<OutputMolecule | null>(null);

    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getExperimentOutput(experimentId);
                setData(res);
                if (res.molecules.length > 0) {
                    setActiveMol(res.molecules[0]);
                }
            } catch (err) {
                console.error("Failed to load analytics: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [experimentId]);

    useEffect(() => {
        if (activeMol && viewerRef.current) {
            if (!viewerInstance.current) {
                viewerInstance.current = $3Dmol.createViewer(viewerRef.current, {
                    backgroundColor: '#f8fafc',
                });
            }
            const viewer = viewerInstance.current;
            viewer.clear();

            if (activeMol.sdf_block) {
                viewer.addModel(activeMol.sdf_block, "sdf");
                viewer.setStyle({}, { stick: { colorscheme: 'Jmol' }, sphere: { radius: 0.3 } });
                viewer.zoomTo();
                viewer.render();
            }
        }
    }, [activeMol]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center p-10 mt-10 border rounded-lg bg-gray-50 animate-pulse">
                <span className="text-gray-500 font-bold">Compiling advanced analytics & 3D coordinate matrices...</span>
            </div>
        );
    }

    if (!data || data.molecules.length === 0) return null;

    // Analytics preparation
    const scatterData = data.molecules.map((m) => ({ name: m.smiles, x: m.sar_x, y: m.sar_y, score: m.score }));

    return (
        <div className="mt-12 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">🔬 Post-Experiment Engine Analytics</h2>
                    <p className="text-slate-300 text-sm mt-1">Reviewing topological profiles and SAR clustering for Exp: {experimentId}</p>
                </div>
                <div className="flex space-x-3">
                    <a href={downloadURL(experimentId, 'csv')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-bold shadow-sm transition">⬇ CSV Data</a>
                    <a href={downloadURL(experimentId, 'sdf')} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-sm font-bold shadow-sm transition">⬇ 3D SDF</a>
                    <a href={downloadURL(experimentId, 'smi')} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-sm font-bold shadow-sm transition">⬇ SMILES</a>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT COLUMN */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Ranked Candidates</h3>
                        <div className="overflow-y-auto max-h-80 shadow-inner rounded-lg border border-gray-200">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-100 sticky top-0 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Rank</th>
                                        <th className="px-4 py-3">Molecule</th>
                                        <th className="px-4 py-3">Score</th>
                                        <th className="px-4 py-3">MW</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.molecules.map((m, i) => (
                                        <tr key={i}
                                            onClick={() => setActiveMol(m)}
                                            className={`cursor-pointer hover:bg-blue-50 transition border-b ${activeMol?.smiles === m.smiles ? 'bg-blue-100 border-blue-400' : 'bg-white'}`}>
                                            <td className="px-4 py-2 font-bold">{i + 1}</td>
                                            <td className="px-4 py-2 font-mono truncate max-w-[150px]">{m.smiles}</td>
                                            <td className="px-4 py-2 font-bold text-emerald-600">{m.score.toFixed(3)}</td>
                                            <td className="px-4 py-2">{m.mw.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Structure-Activity Relationship (SAR) Cluster</h3>
                        <p className="text-xs text-gray-500 mb-2">Molecular similarity mathematically clustered via PCA / t-SNE reduction.</p>
                        <div className="h-48 bg-slate-50 border border-slate-200 rounded-lg p-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis type="number" dataKey="x" name="SAR X" hide />
                                    <YAxis type="number" dataKey="y" name="SAR Y" hide />
                                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Molecules" data={scatterData} fill="#4f46e5" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Model Analytics (Score & ADMET)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-48 bg-slate-50 border border-slate-200 rounded-lg p-2">
                                <p className="text-xs text-center text-gray-500 mb-2 font-bold">LogP Distribution</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={scatterData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="name" hide />
                                        <RechartsTooltip />
                                        <Bar dataKey="score" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-48 bg-slate-50 border border-slate-200 rounded-lg p-2">
                                <p className="text-xs text-center text-gray-500 mb-2 font-bold">Reward Score Fit</p>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.molecules}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                        <XAxis dataKey="smiles" hide />
                                        <RechartsTooltip />
                                        <Bar dataKey="logp" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col h-full space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">3D Topography Explorer</h3>
                    <p className="text-xs text-gray-500 select-none">
                        Currently Viewing: <span className="font-mono text-blue-600 font-bold">{activeMol?.smiles}</span><br />
                        Tip: Left-Click to Rotate, Scroll to Zoom.
                    </p>
                    <div
                        ref={viewerRef}
                        className="w-full flex-1 min-h-[400px] border-2 border-slate-300 rounded-lg relative overflow-hidden shadow-inner cursor-move"
                    ></div>
                </div>

            </div>
        </div>
    );
};

export default OutputDashboard;
