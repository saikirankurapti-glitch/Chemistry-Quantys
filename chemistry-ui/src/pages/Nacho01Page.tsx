import { useState } from 'react';
import { 
    Upload, 
    Cpu, 
    Play, 
    BarChart3, 
    Download, 
    CheckCircle2, 
    AlertCircle, 
    ChevronRight,
    FileText,
    Database,
    Zap
} from 'lucide-react';
import axios from 'axios';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';

const API_BASE = 'http://localhost:8000/api/nacho';

const Nacho01 = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [targetProperty, setTargetProperty] = useState('');
    const [modelType, setModelType] = useState('GNN');
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [predictionSmiles, setPredictionSmiles] = useState('');
    const [predictions, setPredictions] = useState<any[]>([]);

    const steps = [
        { label: 'Dataset', icon: <Database size={18} /> },
        { label: 'Fine-Tuning', icon: <Cpu size={18} /> },
        { label: 'Inference', icon: <Zap size={18} /> },
        { label: 'Results', icon: <BarChart3 size={18} /> }
    ];

    const handleUpload = async () => {
        if (!file || !targetProperty) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_property', targetProperty);
        formData.append('model_type', modelType);

        try {
            const res = await axios.post(`${API_BASE}/train`, formData);
            setJobId(res.data.job_id);
            setActiveStep(1);
            pollStatus(res.data.job_id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pollStatus = async (id: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/model-status/${id}`);
                setStatus(res.data);
                if (res.data.status === 'completed') {
                    clearInterval(interval);
                }
            } catch (err) {
                clearInterval(interval);
            }
        }, 2000);
    };

    const handlePredict = async () => {
        if (!jobId || !predictionSmiles) return;
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/predict/${jobId}`, {
                smiles: predictionSmiles.split('\n').filter(s => s.trim())
            });
            setPredictions(res.data.results);
            setActiveStep(3);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                        <Zap className="text-white" size={28} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Nacho<span className="text-indigo-600">01</span>
                    </h1>
                    <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
                        Foundation Model Fine-tuning
                    </div>
                </div>
                <p className="text-slate-500 font-medium max-w-2xl">
                    Train and fine-tune state-of-the-art molecular foundation models (GNN, Transformer, MPNN) on your custom datasets for high-fidelity property prediction.
                </p>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-4">
                {steps.map((step, idx) => (
                    <button
                        key={idx}
                        onClick={() => idx <= activeStep && setActiveStep(idx)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                            activeStep === idx 
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                            : idx < activeStep 
                            ? 'border-slate-200 bg-white text-slate-400 opacity-60'
                            : 'border-slate-100 bg-slate-50 text-slate-400 opacity-40 cursor-not-allowed'
                        }`}
                    >
                        <div className={`p-2 rounded-xl ${activeStep === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {step.icon}
                        </div>
                        <div className="text-left">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 0{idx + 1}</span>
                            <span className={`font-bold text-sm ${activeStep === idx ? 'text-indigo-900' : 'text-slate-500'}`}>{step.label}</span>
                        </div>
                        {idx < activeStep && <CheckCircle2 className="ml-auto text-emerald-500" size={16} />}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Action Panel */}
                <div className="col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    {activeStep === 0 && (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-extrabold text-slate-900">Dataset Upload</h2>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">CSV</span>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">SDF</span>
                                </div>
                            </div>

                            <div 
                                className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${file ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    className="hidden" 
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className={`p-4 rounded-2xl mb-4 ${file ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{file ? file.name : 'Upload Molecular Dataset'}</h3>
                                <p className="text-slate-500 text-sm mt-1">Drag and drop or click to browse files</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Target Property Column</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="e.g. sol, binding_affinity, logp"
                                        value={targetProperty}
                                        onChange={(e) => setTargetProperty(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Foundation Architecture</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none bg-white"
                                        value={modelType}
                                        onChange={(e) => setModelType(e.target.value)}
                                    >
                                        <option>GNN (Graph Neural Network)</option>
                                        <option>Transformer (Attention-based)</option>
                                        <option>MPNN (Message Passing)</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={handleUpload}
                                disabled={!file || !targetProperty || loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-extrabold text-lg transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Initializing Engine...' : 'Initialize Fine-Tuning'}
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900">Fine-Tuning Architecture</h2>
                                    <p className="text-slate-500 text-sm">GPU Accelerated Foundation Model Adaptation</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-bold text-xs uppercase animate-pulse">
                                    <Cpu size={14} /> Training in Progress
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Epoch</span>
                                    <div className="text-3xl font-black text-slate-900 mt-1">10/10</div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valid R²</span>
                                    <div className="text-3xl font-black text-emerald-600 mt-1">{status?.metrics?.r2?.toFixed(3) || '0.000'}</div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MAE</span>
                                    <div className="text-3xl font-black text-indigo-600 mt-1">{status?.metrics?.mae?.toFixed(3) || '0.000'}</div>
                                </div>
                            </div>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={status?.metrics?.val_loss?.map((v: number, i: number) => ({ epoch: i, loss: v })) || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="epoch" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="loss" stroke="#4F46E5" strokeWidth={4} dot={{ r: 6, fill: '#4F46E5' }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setActiveStep(2)}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Inference <ChevronRight size={18} />
                                </button>
                                <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <Download size={18} /> Model Weights (.pt)
                                </button>
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div className="p-8 space-y-6">
                            <h2 className="text-2xl font-extrabold text-slate-900">Nacho01 Inference Engine</h2>
                            <p className="text-slate-500">Run predictions on new molecules using your fine-tuned foundation model.</p>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Enter SMILES (one per line)</label>
                                <textarea 
                                    className="w-full h-48 px-4 py-4 rounded-3xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
                                    placeholder="CC(=O)OC1=CC=CC=C1C(=O)O&#10;CN1C=NC2=C1C(=O)N(C(=O)N2C)C"
                                    value={predictionSmiles}
                                    onChange={(e) => setPredictionSmiles(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handlePredict}
                                disabled={!predictionSmiles || loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-extrabold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Running Inference...' : 'Generate Neural Predictions'}
                                <Play size={20} fill="currentColor" />
                            </button>
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-extrabold text-slate-900">Neural Prediction Analysis</h2>
                                <button 
                                    onClick={() => setActiveStep(2)}
                                    className="text-indigo-600 font-bold text-sm hover:underline"
                                >
                                    + New Inference
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Molecule</th>
                                            <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Prediction</th>
                                            <th className="py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Confidence</th>
                                            <th className="py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {predictions.map((p, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                            <div className="h-6 w-6 border-2 border-indigo-600/30 rounded-full" />
                                                        </div>
                                                        <code className="text-xs font-medium text-slate-600">{p.smiles.length > 20 ? p.smiles.substring(0, 20) + '...' : p.smiles}</code>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-black">{p.prediction}</span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.confidence * 100}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500">{Math.round(p.confidence * 100)}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                        <FileText size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl transition-all group-hover:bg-indigo-600/30" />
                        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                            <Cpu size={20} className="text-indigo-400" /> System Stats
                        </h3>
                        <div className="space-y-4 relative">
                            <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                <span className="text-slate-400 text-sm font-medium">Model Precision</span>
                                <span className="text-emerald-400 font-bold">FP32 / BF16</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                <span className="text-slate-400 text-sm font-medium">GPU Acceleration</span>
                                <span className="text-indigo-400 font-bold">Enabled (A100)</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                <span className="text-slate-400 text-sm font-medium">Data Dimensions</span>
                                <span className="text-white font-bold">2D + 3D Geometry</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200">
                        <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" /> Preprocessing Log
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">RDKit: Validating molecular valency and canonicalizing SMILES strings...</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">Conformer Gen: Optimizing 3D structures via ETKDGv3 engine...</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">Features: Generating 1024-bit Morgan fingerprints and distance matrices...</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2">Architect's Note</h4>
                        <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                            Nacho01 utilizes a hybrid graph-transformer architecture. By fine-tuning the attention heads on your proprietary dataset, the model gains domain-specific sensitivity while retaining chemical "commonsense" learned during pretraining.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nacho01;
