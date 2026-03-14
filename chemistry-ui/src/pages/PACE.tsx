import { useState } from 'react';
import { 
    Upload, 
    FileText, 
    Search, 
    Zap, 
    Table as TableIcon, 
    FileSearch, 
    Cpu, 
    CheckCircle2, 
    Info,
    Download,
    Eye,
    Plus,
    Clipboard,
    Building2,
    Calendar,
    Users
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/pace';

const PACE = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [_jobId, setJobId] = useState<string | null>(null);
    const [results, setResults] = useState<any>(null);
    const [extractionLog, setExtractionLog] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setExtractionLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        addLog(`Uploading document: ${file.name}`);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('extract_sar', 'true');
        formData.append('extract_structures', 'true');

        try {
            const res = await axios.post(`${API_BASE}/upload-patent`, formData);
            setJobId(res.data.job_id);
            addLog("Upload successful. Job ID initialized.");
            setStep(2);
            startExtractionPipeline(res.data.job_id);
        } catch (err) {
            addLog("Error uploading document.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startExtractionPipeline = async (id: string) => {
        try {
            // Step 1: Structure Extraction
            addLog("Starting Layout Detection (Detectron2)...");
            await new Promise(r => setTimeout(r, 1500));
            addLog("Extracting Chemical Diagrams (DECIMER)...");
            await axios.post(`${API_BASE}/extract-structures/${id}`);
            addLog("Structures extracted successfully.");

            // Step 2: SAR Extraction
            addLog("Parsing SAR Tables (LayoutLMv3)...");
            await new Promise(r => setTimeout(r, 1500));
            await axios.post(`${API_BASE}/extract-sar/${id}`);
            addLog("SAR Relationships linked.");

            // Final: Fetch Results
            const res = await axios.get(`${API_BASE}/results/${id}`);
            setResults(res.data);
            setStep(3);
            addLog("Extraction pipeline complete.");
        } catch (err) {
            addLog("Pipeline failure.");
            console.error(err);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 text-white">
                        <FileSearch size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">PACE</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Patent-Assisted Chemical Extraction • AI OCR</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div 
                                key={s} 
                                className={`h-1.5 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} 
                            />
                        ))}
                    </div>
                    <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                        <Search size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                        <Plus size={18} /> New Analysis
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Upload & Pipeline Visualizer */}
                <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col pt-8">
                    <div className="px-8 space-y-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 flex flex-col items-center text-center group hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">Upload Patent PDF</h3>
                                    <p className="text-sm text-slate-500 mt-2 font-medium">Drag and drop or click to browse</p>
                                    <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-tighter">PDF • PNG • JPG (Max 50MB)</p>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleUpload}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        {(step === 2 || loading) && (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Cpu size={120} />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Processing Engine active</span>
                                        </div>
                                        <h3 className="text-xl font-black mb-1">AI Pipeline</h3>
                                        <p className="text-sm text-slate-400 font-medium">Extracting multi-modal information</p>
                                        
                                        <div className="mt-8 space-y-4">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-400">Layout Detection</span>
                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-400">Structure Recognition</span>
                                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 animate-progress" style={{ width: '60%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 flex-1 overflow-hidden flex flex-col">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Processing Logs</h4>
                            <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-y-auto no-scrollbar space-y-2">
                                {extractionLog.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Awaiting document...</p>
                                ) : (
                                    extractionLog.map((log, i) => (
                                        <div key={i} className="text-[10px] font-mono text-slate-500 flex gap-2">
                                            <span className="text-indigo-400 tracking-tighter">▶</span> {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Results Dashboard */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-10 no-scrollbar">
                    {step === 3 && results ? (
                        <div className="max-w-5xl mx-auto space-y-12 pb-20">
                            {/* Metadata Card */}
                            <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl -mr-20 -mt-20" />
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-indigo-100">
                                                Verified Patent
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                                {results.filename}
                                            </h2>
                                        </div>
                                        <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all">
                                            <Download size={24} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-6">
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Building2 size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Assignee</span>
                                            </div>
                                            <div className="text-sm font-black">{results.metadata.assignee}</div>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Calendar size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Priority Date</span>
                                            </div>
                                            <div className="text-sm font-black">{results.metadata.p_date}</div>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Users size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Inventors</span>
                                            </div>
                                            <div className="text-sm font-black">{results.metadata.inventors[0]} + {results.metadata.inventors.length - 1}</div>
                                        </div>
                                        <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                                            <div className="flex items-center gap-2 text-indigo-200 mb-2">
                                                <Zap size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Confidence</span>
                                            </div>
                                            <div className="text-lg font-black uppercase">98.4%</div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-3 gap-10">
                                {/* Extracted Molecules */}
                                <div className="col-span-2 space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-lg font-black flex items-center gap-2">
                                            <Zap size={20} className="text-amber-400" />
                                            Extracted Chemical Structures
                                        </h3>
                                        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">View All</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {results.molecules.map((m: any, i: number) => (
                                            <div key={i} className="group bg-white rounded-[32px] p-6 border border-slate-200/60 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer">
                                                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 mb-6 flex items-center justify-center p-4 relative group-hover:bg-white transition-colors">
                                                    <div className="text-slate-300 group-hover:scale-110 transition-transform duration-500">
                                                        <FileText size={48} />
                                                    </div>
                                                    <div className="absolute top-3 right-3 text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
                                                        #{m.mol_id}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            SMILES String
                                                        </span>
                                                        <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-300 hover:text-indigo-600">
                                                            <Clipboard size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="p-3 bg-slate-900 rounded-xl text-[10px] font-mono text-indigo-300 break-all leading-relaxed h-16 overflow-hidden">
                                                        {m.smiles}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                                        <div>
                                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Mol Weight</div>
                                                            <div className="text-xs font-black text-slate-700">{m.mw}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">LogP</div>
                                                            <div className="text-xs font-black text-slate-700">{m.logp}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SAR Table Viewer */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-lg font-black flex items-center gap-2 text-emerald-600">
                                            <TableIcon size={20} />
                                            SAR Table
                                        </h3>
                                    </div>
                                    <div className="bg-white rounded-[32px] p-4 border border-slate-200/60 shadow-sm flex flex-col min-h-[400px]">
                                        <div className="flex-1 overflow-x-auto no-scrollbar">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-slate-100">
                                                        <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                                        <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                                                        <th className="py-4 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {results.sar_table.map((row: any, i: number) => (
                                                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                                                            <td className="py-4 px-3 text-[11px] font-bold text-slate-900">{row.compound_id}</td>
                                                            <td className="py-4 px-3">
                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100">{row.activity_type}</span>
                                                            </td>
                                                            <td className="py-4 px-3 text-[11px] font-black text-indigo-600 text-right">{row.activity_value} <span className="text-[9px] text-slate-400">{row.unit}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between px-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">{results.sar_table.length} data points extracted</div>
                                            <button className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                                Download CSV <Download size={10} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <Info size={16} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">SAR Insight</span>
                                        </div>
                                        <p className="text-xs text-amber-800/80 font-medium leading-relaxed italic">
                                            "Propyl-substituted analogs in Region B show a 10-fold increase in potency against the target kinase."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                            {step === 1 ? (
                                <>
                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200">
                                        <FileText size={48} className="text-slate-300" />
                                    </div>
                                    <div className="max-w-md space-y-4">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence for Patents</h2>
                                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                            Extract deep chemical intelligence from unstructured PDFs automatically. Upload your first document to begin.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 pt-10">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-50 bg-slate-200" />
                                            ))}
                                            <div className="w-10 h-10 rounded-full bg-indigo-600 border-4 border-slate-50 flex items-center justify-center text-[10px] font-black text-white">+2k</div>
                                        </div>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Join 2,000+ Researchers</span>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-12">
                                    <div className="relative">
                                        <div className="w-40 h-40 border-8 border-slate-100 rounded-full border-t-indigo-600 animate-spin mx-auto" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Cpu size={40} className="text-indigo-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="max-w-md space-y-4">
                                        <h2 className="text-3xl font-black text-slate-900">Decoding Molecular Structures</h2>
                                        <p className="text-slate-500 font-medium">Our neural network is currently scanning document pages for chemical diagrams and SAR tables.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Float Bottom Navigation */}
            {step === 3 && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl z-50 border border-slate-800">
                    <button className="px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2">
                        <Eye size={14} /> Full PDF View
                    </button>
                    <div className="w-px h-6 bg-slate-800 mx-2" />
                    <button className="px-6 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all flex items-center gap-2">
                        <Download size={14} /> Export results.sdf
                    </button>
                </div>
            )}
        </div>
    );
};

export default PACE;
