import React from 'react';
import { Play, Activity, Thermometer, ShieldCheck } from 'lucide-react';

interface Props {
    isSimulating: boolean;
}

const SimulationEnginePanel: React.FC<Props> = ({ isSimulating }) => {
    return (
        <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Activity size={120} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                        <Play size={24} fill="white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">OpenMM Dynamics Core</h2>
                        <p className="text-slate-400 text-sm">Non-equilibrium switching across lambda states.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {[
                    { label: 'Temperature', value: '300 K', icon: <Thermometer size={16} /> },
                    { label: 'Iterations', value: '5000', icon: <Activity size={16} /> },
                    { label: 'States', value: '12 Lambda', icon: <Activity size={16} /> },
                    { label: 'Precision', value: 'Mixed', icon: <ShieldCheck size={16} /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-bold uppercase tracking-wider">
                            {stat.icon} {stat.label}
                        </div>
                        <div className="text-xl font-bold">{stat.value}</div>
                    </div>
                ))}
            </div>

            {isSimulating && (
                <div className="mt-8 space-y-3 relative z-10">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Simulation Pipeline Progress</span>
                        <span className="text-2xl font-black">74%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[74%] animate-progress-stripes bg-[length:20px_20px]" 
                             style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)' }}>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium italic">Integrating Langevin equations of motion...</p>
                </div>
            )}
        </div>
    );
};

export default SimulationEnginePanel;
