import React, { useState, useMemo } from 'react';
import { 
    Upload, 
    Layers, 
    Maximize2, 
    Download, 
    Map as MapIcon,
    RefreshCw,
    X,
    ChevronRight,
    Beaker
} from 'lucide-react';
import axios from 'axios';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const API_BASE = 'http://localhost:8000/api/molspace';

const MolSpace = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [points, setPoints] = useState<any[]>([]);
    const [selectedMol, setSelectedMol] = useState<any>(null);
    const [molInfo, setMolInfo] = useState<any>(null);
    const [colorBy, setColorBy] = useState<'mw' | 'logp'>('mw');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post(`${API_BASE}/upload-dataset`, formData);
            setSessionId(uploadRes.data.session_id);
            
            const mapRes = await axios.post(`${API_BASE}/generate-map/${uploadRes.data.session_id}`, {
                n_neighbors: 15,
                min_dist: 0.1,
                metric: 'jaccard'
            });
            setPoints(mapRes.data.points);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePointClick = async (data: any) => {
        setSelectedMol(data);
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/molecule-info/${sessionId}/${data.id}`);
            setMolInfo(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getColor = (value: number, min: number, max: number) => {
        const ratio = (value - min) / (max - min);
        // Indigo to Cyan gradient
        const r = Math.floor(79 + (ratio * (6 - 79)));
        const g = Math.floor(70 + (ratio * (182 - 70)));
        const b = Math.floor(229 + (ratio * (212 - 229)));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const stats = useMemo(() => {
        if (points.length === 0) return { min: 0, max: 0 };
        const vals = points.map(p => p[colorBy]);
        return {
            min: Math.min(...vals),
            max: Math.max(...vals)
        };
    }, [points, colorBy]);

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 text-white">
                        <MapIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">MolSpace</h1>
                        <p className="text-xs text-slate-500 font-medium">Chemical Space Explorer • High Dimensional Projection</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {!sessionId ? (
                        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-all shadow-md shadow-indigo-100">
                            <Upload size={16} />
                            Upload Dataset
                            <input type="file" className="hidden" onChange={handleUpload} />
                        </label>
                    ) : (
                        <div className="flex items-center gap-2">
                            <select 
                                className="bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={colorBy}
                                onChange={(e) => setColorBy(e.target.value as any)}
                            >
                                <option value="mw">Color by MW</option>
                                <option value="logp">Color by LogP</option>
                            </select>
                            <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {/* Map Area */}
                <div className="flex-1 p-8 overflow-hidden flex flex-col">
                    {!sessionId ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200">
                                <Layers size={48} />
                            </div>
                            <div className="max-w-md">
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Initialize Chemical Space</h2>
                                <p className="text-slate-500 font-medium">Upload a SMILES or SDF library to generate an interactive map using UMAP dimensionality reduction on Morgan fingerprints.</p>
                            </div>
                            <label className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg cursor-pointer transition-all shadow-xl shadow-indigo-100">
                                Start Mapping
                                <input type="file" className="hidden" onChange={handleUpload} />
                            </label>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative group">
                            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <div className="px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-xl shadow-sm text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                    {points.length} Molecules Projected
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" dataKey="x" hide />
                                    <YAxis type="number" dataKey="y" hide />
                                    <ZAxis type="number" range={[40, 400]} />
                                    <Tooltip 
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold min-w-[140px]">
                                                        <div className="mb-2 text-indigo-400">{data.label}</div>
                                                        <div className="flex justify-between gap-4 mb-1">
                                                            <span className="text-slate-400 font-medium uppercase tracking-tighter">MW</span>
                                                            <span>{data.mw.toFixed(1)}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-slate-400 font-medium uppercase tracking-tighter">LogP</span>
                                                            <span>{data.logp.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter 
                                        name="Molecules" 
                                        data={points} 
                                        onClick={handlePointClick}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {points.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={getColor(entry[colorBy], stats.min, stats.max)} 
                                                fillOpacity={0.7}
                                                stroke={selectedMol?.id === entry.id ? 'white' : 'transparent'}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Inspect Panel */}
                <aside className={`w-96 bg-white border-l border-slate-200 flex flex-col transition-all duration-500 transform ${selectedMol ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Molecule Inspector</h3>
                        <button 
                            onClick={() => setSelectedMol(null)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                        {selectedMol && (
                            <>
                                <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden p-4 relative group">
                                    {loading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="text-indigo-600 animate-spin" size={24} />
                                            <span className="text-xs font-bold text-slate-400">Rendering...</span>
                                        </div>
                                    ) : molInfo ? (
                                        <div 
                                            className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-110 duration-500"
                                            dangerouslySetInnerHTML={{ __html: molInfo.svg }}
                                        />
                                    ) : (
                                        <div className="text-slate-300">
                                            <Beaker size={48} />
                                        </div>
                                    )}
                                    <button className="absolute bottom-4 right-4 p-2 bg-white rounded-xl shadow-md text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                        <Maximize2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Properties</span>
                                        <div className="h-px flex-1 mx-4 bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {molInfo?.properties && Object.entries(molInfo.properties).map(([key, val]: any) => (
                                            <div key={key} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{key}</div>
                                                <div className="text-sm font-black text-slate-900">{val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SMILES</span>
                                        <button className="text-[10px] font-black text-indigo-600 hover:underline">COPY</button>
                                    </div>
                                    <div className="p-4 bg-slate-900 rounded-2xl text-[11px] font-mono text-indigo-300 break-all leading-relaxed border border-indigo-900/50">
                                        {molInfo?.smiles || 'Loading...'}
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 text-sm">
                                    <Download size={16} /> Export Detailed Report
                                </button>
                            </>
                        )}
                    </div>
                </aside>
            </main>

            {/* Bottom Bar Stats */}
            {points.length > 0 && (
                <footer className="bg-white border-t border-slate-200 px-8 py-3 flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-300">Engine:</span>
                            <span className="text-indigo-600">UMAP Pro</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-300">Metric:</span>
                            <span className="text-indigo-600">Jaccard (BitVect)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-indigo-500" />
                            <span>Low {colorBy}</span>
                        </div>
                        <ChevronRight size={12} />
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-cyan-400" />
                            <span>High {colorBy}</span>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default MolSpace;
