import React from 'react';
import { Download, FileText, TrendingDown, Target, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AlchemistryResults } from '../../services/api';

interface Props {
    results: AlchemistryResults | null;
}

const ResultsPanel: React.FC<Props> = ({ results }) => {
    if (!results) return null;

    return (
        <div className="space-y-8 animate-in zoom-in duration-500">
            {/* ΔG Report Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                            <TrendingDown size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">Final ΔG Binding</h4>
                    </div>
                    <div className="text-3xl font-black text-rose-600">
                        {results.deltaG.toFixed(2)} <span className="text-sm font-medium text-slate-400">kcal/mol</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Aggregated relative binding free energy.</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                            <Target size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">Prediction Confidence</h4>
                    </div>
                    <div className="text-3xl font-black text-emerald-600">
                        {(results.confidence * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Statistical reliability of MD convergence.</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            <Zap size={20} />
                        </div>
                        <h4 className="font-bold text-slate-800">Transformations</h4>
                    </div>
                    <div className="text-3xl font-black text-blue-600">{results.transformations.length} Pairs</div>
                    <p className="text-xs text-slate-500 mt-2">Drawn from {results.num_ligands} unique ligands.</p>
                </div>
            </div>

            {/* Main Data View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Binding Energy Chart */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                             Snapshot Connectivity
                        </h3>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.snapshots}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                <XAxis dataKey="frame" hide />
                                <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Line 
                                    type="monotone" 
                                    dataKey="energy" 
                                    stroke="#ec4899" 
                                    strokeWidth={3} 
                                    dot={false}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transformations Table */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">ΔG Result Matrix</h3>
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">Mutation (A → B)</th>
                                    <th className="px-6 py-4">ΔG (kcal/mol)</th>
                                    <th className="px-6 py-4">Error</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.transformations.map((t, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {t.ligand_a} → {t.ligand_b}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-rose-600">{t.dg}</td>
                                        <td className="px-6 py-4 text-slate-400">± {t.error}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-4">
                <button className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
                    <FileText size={20} /> Download ΔG Report (PDF)
                </button>
                <button className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
                    <Download size={20} /> Export Trajectory Data
                </button>
            </div>
        </div>
    );
};

export default ResultsPanel;
