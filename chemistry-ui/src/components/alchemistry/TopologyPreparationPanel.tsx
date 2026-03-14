import React from 'react';
import { Network, GitMerge, Layers } from 'lucide-react';

interface Props {
    isVisible: boolean;
    isProcessing: boolean;
}

const TopologyPreparationPanel: React.FC<Props> = ({ isVisible, isProcessing }) => {
    if (!isVisible) return null;

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <Network size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Dual Topology Mapping</h2>
                </div>
                {isProcessing && (
                    <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Syncing Atoms...</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'State A (Reference)', icon: <Layers size={18} />, color: 'blue' },
                    { label: 'Mapping Logic', icon: <GitMerge size={18} />, color: 'indigo' },
                    { label: 'State B (Target)', icon: <Layers size={18} />, color: 'teal' }
                ].map((step, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 relative">
                        <div className={`text-${step.color}-500 mb-3`}>{step.icon}</div>
                        <p className="text-sm font-bold text-slate-800 mb-1">{step.label}</p>
                        <p className="text-xs text-slate-500">Atom-to-atom coordinate alignment for ΔG switching simulation.</p>
                        {isProcessing && (
                            <div className="absolute bottom-4 right-4 text-[10px] font-black text-indigo-300 animate-pulse">ALIGNED</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopologyPreparationPanel;
