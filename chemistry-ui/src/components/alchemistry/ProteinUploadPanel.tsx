import React from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';

interface Props {
    file: File | null;
    setFile: (file: File | null) => void;
}

const ProteinUploadPanel: React.FC<Props> = ({ file, setFile }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-500" />
                <h3 className="text-lg font-bold text-slate-800">1. Protein Structure</h3>
            </div>
            <div 
                onClick={handleClick}
                className={`
                relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer
                ${file ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50'}
            `}>
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className={`p-4 rounded-full mb-3 ${file ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-500'}`}>
                    {file ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                </div>
                <span className="text-sm font-semibold text-slate-700 text-center">
                    {file ? file.name : 'Upload Target Protein (PDB)'}
                </span>
                {file && <span className="text-xs text-green-600 mt-1 font-medium">Structure Validated</span>}
            </div>
        </div>
    );
};

export default ProteinUploadPanel;
