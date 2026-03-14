import React from 'react';
import { Database, Beaker, CheckCircle2 } from 'lucide-react';

interface Props {
    file: File | null;
    setFile: (file: File | null) => void;
    stats?: { number_of_molecules: number, validation_status: string } | null;
}

const LigandUploadPanel: React.FC<Props> = ({ file, setFile, stats }) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleLigandUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-4">
                <Database className="text-purple-500" />
                <h3 className="text-lg font-bold text-slate-800">2. Ligand Dataset</h3>
            </div>
            <div 
                onClick={handleClick}
                className={`
                relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer
                ${file ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50/50'}
            `}>
                <input 
                    ref={inputRef}
                    type="file" 
                    className="hidden"
                    onChange={handleLigandUpload}
                />
                <div className={`p-4 rounded-full mb-3 ${file ? 'bg-green-100 text-green-600' : 'bg-purple-50 text-purple-500'}`}>
                    {file ? <CheckCircle2 size={32} /> : <Beaker size={32} />}
                </div>
                <span className="text-sm font-semibold text-slate-700 text-center">
                    {file ? file.name : 'Upload Ligand Series (SDF/CSV)'}
                </span>
                {file && (
                    <div className="mt-2 text-center">
                        <span className="text-xs text-green-600 font-bold block">
                            {stats ? `${stats.number_of_molecules} Molecules Detected` : 'Parsing Dataset...'}
                        </span>
                        {stats?.validation_status === "Passed" && (
                            <span className="text-[10px] text-green-500 font-medium">Validation Passed (RDKit)</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LigandUploadPanel;
