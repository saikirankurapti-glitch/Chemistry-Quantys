import React, { useState } from 'react';
import axios from 'axios';
import { 
    Upload, 
    Table, 
    Cpu, 
    BarChart3, 
    Download, 
    CheckCircle2, 
    FileSpreadsheet,
    Target,
    Filter,
    Layers,
    Play
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer
} from 'recharts';

const ModelTraining: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [propertyName, setPropertyName] = useState('Solubility');
    const [modelType, setModelType] = useState('Random Forest');
    const [isProcessing, setIsProcessing] = useState(false);
    const [jobId, setJobId] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [stats, setStats] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);

    const handleUpload = async () => {
        if (!file) return;
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_property', propertyName);

        try {
            const res = await axios.post('http://localhost:8000/api/model-training/upload', formData);
            setStats(res.data.stats);
            setJobId(res.data.job_id);
            setStep(2);
        } catch (err) {
            alert('Upload failed: ' + err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTrain = async () => {
        if (!jobId) return;
        setIsProcessing(true);
        try {
            const res = await axios.post(`http://localhost:8000/api/model-training/train/${jobId}`, {
                target_property: propertyName,
                model_type: modelType,
                problem_type: 'regression'
            });
            setMetrics(res.data.metrics);
            setStep(3);
        } catch (err) {
            alert('Training failed: ' + err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
                    Chemistry Model Training
                </h1>
                <p className="text-slate-500 text-lg">
                    Build predictive machine learning models directly from chemical datasets.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                {[
                    { id: 1, label: 'Data Selection', icon: <Upload size={18}/> },
                    { id: 2, label: 'Features & Config', icon: <Cpu size={18}/> },
                    { id: 3, label: 'Evaluation', icon: <BarChart3 size={18}/> }
                ].map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                        <div className={`
                            h-10 w-10 rounded-xl flex items-center justify-center font-bold transition-all
                            ${step >= s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}
                        `}>
                            {step > s.id ? <CheckCircle2 size={20}/> : s.id}
                        </div>
                        <span className={`text-sm font-semibold ${step >= s.id ? 'text-indigo-900' : 'text-slate-400'}`}>
                            {s.label}
                        </span>
                        {s.id < 3 && <div className="hidden md:block w-20 h-0.5 bg-slate-100 mx-4" />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Workflows */}
                <div className="lg:col-span-2 space-y-8">
                    {step === 1 && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <FileSpreadsheet size={24}/>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Upload Dataset</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center hover:bg-slate-50/50 hover:border-indigo-200 transition-all cursor-pointer group">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="p-5 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="text-indigo-500" size={32}/>
                                    </div>
                                    <p className="text-slate-600 font-semibold text-lg">
                                        {file ? file.name : "Drag and drop your dataset"}
                                    </p>
                                    <p className="text-slate-400 text-sm mt-2">Supports CSV, SDF formats</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Target size={16} className="text-indigo-500"/> Target Property Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={propertyName}
                                        onChange={(e) => setPropertyName(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                                        placeholder="e.g. Solubility, IC50, pEC50"
                                    />
                                </div>

                                <button 
                                    onClick={handleUpload}
                                    disabled={!file || isProcessing}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? "Analyzing Dataset..." : "Continue to Preprocessing"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && stats && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <Filter className="text-teal-500"/>
                                    <h2 className="text-2xl font-bold text-slate-900">Dataset Overview</h2>
                                </div>
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-slate-500 text-sm font-bold uppercase mb-1">Molecules</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.total_molecules}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-slate-500 text-sm font-bold uppercase mb-1">Missing Targets</p>
                                        <p className="text-3xl font-black text-rose-500">{stats.missing_values}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-slate-500 text-sm font-bold uppercase mb-1">Target</p>
                                        <p className="text-xl font-bold text-slate-900 truncate">{stats.target}</p>
                                    </div>
                                </div>

                                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
                                    <CheckCircle2 className="text-amber-600 mt-1" size={20}/>
                                    <div>
                                        <p className="font-bold text-amber-900">Preprocessing Recommendation</p>
                                        <p className="text-sm text-amber-800">
                                            We will automatically remove invalid molecules and duplicates. SMILES strings will be standardized using RDKit before featurization.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <Layers className="text-purple-500"/>
                                    <h2 className="text-2xl font-bold text-slate-900">Model Configuration</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Featurization Method</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200">
                                                <p className="font-bold text-indigo-900">RDKit Descriptors</p>
                                                <p className="text-xs text-indigo-700">MW, LogP, TPSA, Rotatable Bonds...</p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                                                <p className="font-bold text-purple-900">Morgan Fingerprints</p>
                                                <p className="text-xs text-purple-700">Bit vector (1024 bits), Radius 2</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">Model Engine</label>
                                        <select 
                                            value={modelType}
                                            onChange={(e) => setModelType(e.target.value)}
                                            className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 font-bold"
                                        >
                                            <option>Random Forest</option>
                                            <option>XGBoost (Experimental)</option>
                                            <option>Neural Network (Experimental)</option>
                                        </select>
                                    </div>

                                    <button 
                                        onClick={handleTrain}
                                        disabled={isProcessing}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? "Training Model..." : <><Play size={18}/> Start Training Pipeline</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && metrics && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in zoom-in duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="text-green-500"/>
                                    <h2 className="text-2xl font-bold text-slate-900">Model Performance</h2>
                                </div>
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                                    Training Completed
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">R² Score</p>
                                    <p className="text-3xl font-black text-indigo-600">{metrics.r2.toFixed(3)}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">RMSE</p>
                                    <p className="text-3xl font-black text-slate-900">{metrics.rmse.toFixed(3)}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">MAE</p>
                                    <p className="text-3xl font-black text-slate-900">{metrics.mae.toFixed(3)}</p>
                                </div>
                            </div>

                            <div className="h-64 bg-slate-50 rounded-2xl p-6 mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'R2', value: metrics.r2 },
                                        { name: 'Error Margin', value: metrics.mae }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3}/>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex items-center gap-4">
                                <a 
                                    href={`http://localhost:8000/api/model-training/download/${jobId}`}
                                    className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={18}/> Download Trained Model (.pkl)
                                </a>
                                <button 
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                                >
                                    New Model
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100">
                        <h3 className="text-xl font-bold mb-4">Pipeline Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-indigo-300 animate-pulse' : 'bg-slate-400 opacity-30'}`} />
                                <span className={`text-sm ${step >= 1 ? 'font-bold' : 'opacity-50'}`}>Data Ingestion</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-indigo-300 animate-pulse' : 'bg-white/20'}`} />
                                <span className={`text-sm ${step >= 2 ? 'font-bold' : 'opacity-40'}`}>Featurization</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-indigo-300 animate-pulse' : 'bg-white/20'}`} />
                                <span className={`text-sm ${step >= 3 ? 'font-bold' : 'opacity-40'}`}>Model Fitting</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Table size={18} className="text-indigo-500"/> Features Utilized
                        </h3>
                        <div className="space-y-2">
                            {['Physicochemical Descriptors', '2D Fingerprints', 'Topological Indices', 'Weight & Lipophilicity'].map(f => (
                                <div key={f} className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelTraining;
