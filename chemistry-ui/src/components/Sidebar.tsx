import { NavLink } from 'react-router-dom';
import {
    FlaskConical,
    Activity,
    BrainCircuit,
    GitBranch,
    Beaker,
    Zap,
    Map,
    FileSearch
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Generative Chemistry', path: '/generative-chemistry', icon: <FlaskConical size={20} /> },
        { name: 'MDFlow', path: '/mdflow', icon: <Activity size={20} /> },
        { name: 'Model Training', path: '/model-training', icon: <BrainCircuit size={20} /> },
        { name: 'Retrosynthesis', path: '/retrosynthesis', icon: <GitBranch size={20} /> },
        { name: 'Alchemistry', path: '/alchemistry', icon: <Beaker size={20} /> },
        { name: 'Nacho01', path: '/nacho01', icon: <Zap size={20} /> },
        { name: 'MolSpace', path: '/molspace', icon: <Map size={20} /> },
        { name: 'PACE', path: '/pace', icon: <FileSearch size={20} /> },
    ];

    return (
        <div className="w-64 bg-slate-900 h-screen fixed top-0 left-0 flex flex-col shadow-2xl z-50 transition-all duration-300">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/50 shadow-lg">
                    <span className="text-white font-extrabold text-2xl tracking-tighter"></span>
                </div>
                <div className="flex flex-col">
                    <span className="font-extrabold text-2xl text-white tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Chemistry<span className="text-white"> Quantis</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Drug Discovery Platform</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                    Applications
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-indigo-600 shadow-md shadow-indigo-900/50 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                        `}
                    >
                        <div className={`
                            transition-colors duration-200
                            group-hover:text-indigo-400
                        `}>
                            {item.icon}
                        </div>
                        <span className="font-medium text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800 m-4 rounded-xl bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center border-2 border-slate-700">
                        <span className="text-xs font-bold text-white">AD</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white leading-tight">Admin User</span>
                        <span className="text-xs text-slate-400">System Architect</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
