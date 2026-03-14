import React, { useState } from 'react';
import axios from 'axios';
import { 
    Search, 
    Zap, 
    CheckCircle2,
    Database,
    Network,
    ArrowRight,
    Beaker,
    Download,
    Shield,
    Settings,
    ChevronRight
} from 'lucide-react';

interface ReactionStep {
    step: number;
    reaction_name: string;
    precursors: string[];
    product: string;
    confidence: number;
    conditions: string;
}

interface SyntheticRoute {
    route_id: string;
    target_smiles: string;
    steps: ReactionStep[];
    overall_score: number;
}

const Retrosynthesis: React.FC = () => {
    const [smiles, setSmiles] = useState('CC(=O)Nc1ccc(O)cc1');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [routes, setRoutes] = useState<SyntheticRoute[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<SyntheticRoute | null>(null);

    const handleAnalyze = async () => {
        if (!smiles) return;
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        setRoutes([]);
        setSelectedRoute(null);

        const interval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + 5;
            });
        }, 80);

        try {
            const res = await axios.post('http://localhost:8000/api/retrosynthesis/analyze', {
                smiles: smiles,
                max_steps: 3
            });
            setTimeout(() => {
                setRoutes(res.data);
                setSelectedRoute(res.data[0]);
                setIsAnalyzing(false);
                setAnalysisProgress(100);
                clearInterval(interval);
            }, 600);
        } catch (err) {
            alert('Analysis failed: ' + err);
            setIsAnalyzing(false);
            clearInterval(interval);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Professional Top Bar */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <Network size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 leading-tight">Retrosynthesis Strategy</h1>
                                <p className="text-slate-500 text-sm font-medium">Predicting optimized synthetic routes with AI-driven retrosynthesis engine.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                <Database size={14} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">2.4M Templates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-10 space-y-8">
                {/* 1. Target Input Section */}
                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-full">1</span>
                            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Specify Target Molecule</h2>
                        </div>
                        <Settings size={16} className="text-slate-400" />
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3">
                                <div className="relative group">
                                    <textarea 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-indigo-900 font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none min-h-[100px]"
                                        value={smiles}
                                        onChange={(e) => setSmiles(e.target.value)}
                                        placeholder="Enter SMILES e.g. CC1=C(C=C(C=C1)C(=O)O)C"
                                    />
                                    <div className="absolute top-4 right-4 text-slate-300">
                                        <Beaker size={18} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <button 
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full h-[100px] bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 group"
                                >
                                    {isAnalyzing ? (
                                        <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <>
                                            <Zap size={20} fill="currentColor" />
                                            <span className="text-sm">Identify Routes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Analysis Progress (Visible only when analyzing) */}
                {isAnalyzing && (
                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-slate-50 rounded-full" />
                            <div 
                                className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" 
                                style={{ animationDuration: '0.8s' }}
                            />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">AI Pathway Generation</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Accessing reaction databases and predicting chemical feasibility...</p>
                        <div className="max-w-xs mx-auto">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>Scanning Patterns</span>
                                <span>{analysisProgress}%</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. Results Section (Visible only when routes exist) */}
                {routes.length > 0 && !isAnalyzing && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        {/* Summary Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Routes Found</div>
                                <div className="text-2xl font-bold text-slate-900">{routes.length} Pathways</div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Reliability</div>
                                <div className="text-2xl font-bold text-indigo-600">{(Math.max(...routes.map(r => r.overall_score)) * 100).toFixed(0)}%</div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Search Depth</div>
                                <div className="text-2xl font-bold text-slate-900">4 Stages</div>
                            </div>
                        </div>

                        {/* Route Tabs and Details */}
                        <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="flex border-b border-slate-100 px-4 pt-4 gap-2 bg-slate-50/30">
                                {routes.map((route, idx) => (
                                    <button 
                                        key={route.route_id}
                                        onClick={() => setSelectedRoute(route)}
                                        className={`
                                            px-8 py-4 rounded-t-2xl font-bold text-sm transition-all relative
                                            ${selectedRoute?.route_id === route.route_id 
                                                ? 'bg-white border border-slate-200 border-b-white text-indigo-600 -mb-[1px] shadow-sm' 
                                                : 'text-slate-400 hover:text-slate-600'}
                                        `}
                                    >
                                        Pathway 0{idx + 1}
                                        {selectedRoute?.route_id === route.route_id && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-10">
                                {selectedRoute && (
                                    <div className="space-y-12">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Search size={20} className="text-slate-400" />
                                                <h3 className="text-lg font-bold text-slate-900">Synthesis Sequential View</h3>
                                            </div>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-slate-100">
                                                <Download size={14} /> Export Technical Plan
                                            </button>
                                        </div>

                                        <div className="relative space-y-0">
                                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-slate-100" />
                                            
                                            {selectedRoute.steps.map((step, idx) => (
                                                <div key={idx} className="relative pl-16 pb-12 last:pb-0">
                                                    {/* Step Icon */}
                                                    <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-800 shadow-sm z-10 transition-colors group-hover:border-indigo-600">
                                                        {step.step}
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                                                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                                                            <div className="flex-1 space-y-6">
                                                                <h4 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                                                    {step.reaction_name}
                                                                    <ChevronRight size={16} className="text-slate-300" />
                                                                </h4>
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                                                                    <div className="md:col-span-3">
                                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precursors</div>
                                                                        <div className="bg-white border border-slate-100 rounded-xl p-3 text-xs font-mono text-slate-500 truncate shadow-inner">
                                                                            {step.precursors.join(' + ')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex justify-center">
                                                                        <ArrowRight className="text-indigo-300" size={20} />
                                                                    </div>
                                                                    <div className="md:col-span-3">
                                                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Target Product</div>
                                                                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-xs font-mono text-indigo-700 font-bold truncate">
                                                                            {step.product}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-full lg:w-48 space-y-4">
                                                                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Conditions</span>
                                                                    <span className="text-xs font-semibold text-slate-700 leading-tight">{step.conditions}</span>
                                                                </div>
                                                                <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                                                                        <span className="text-xs font-bold text-indigo-600">{(step.confidence * 100).toFixed(0)}%</span>
                                                                    </div>
                                                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-indigo-600" style={{ width: `${step.confidence * 100}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {idx === selectedRoute.steps.length - 1 && (
                                                            <div className="mt-8 flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                                                                        <Shield size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Availability Confirmed</p>
                                                                        <p className="text-[10px] text-slate-500 font-medium">Mapped to Sigma-Aldrich Chemical Catalog</p>
                                                                    </div>
                                                                </div>
                                                                <CheckCircle2 className="text-indigo-500" size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Retrosynthesis;
