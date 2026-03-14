import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import GenerativeChemistry from './pages/GenerativeChemistry';
import MDFlow from './pages/MDFlow';
import ModelTraining from './pages/ModelTraining';
import Retrosynthesis from './pages/Retrosynthesis';
import Alchemistry from './pages/Alchemistry';
import Nacho01 from './pages/Nacho01Page';
import MolSpace from './pages/MolSpace';
import PACE from './pages/PACE';

function App() {
    return (
        <Router>
            <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-indigo-200">
                <Sidebar />
                <main className="flex-1 ml-64 overflow-y-auto w-full transition-all duration-300">
                    <Routes>
                        <Route path="/" element={<Navigate to="/generative-chemistry/experiment" replace />} />
                        <Route path="/generative-chemistry/*" element={<GenerativeChemistry />} />
                        <Route path="/mdflow" element={<MDFlow />} />
                        <Route path="/model-training" element={<ModelTraining />} />
                        <Route path="/retrosynthesis" element={<Retrosynthesis />} />
                        <Route path="/alchemistry" element={<Alchemistry />} />
                        <Route path="/nacho01" element={<Nacho01 />} />
                        <Route path="/molspace" element={<MolSpace />} />
                        <Route path="/pace" element={<PACE />} />
                        <Route path="*" element={
                            <div className="flex flex-col items-center justify-center h-full">
                                <h1 className="text-6xl font-black text-slate-200 mb-4">404</h1>
                                <p className="text-xl text-slate-500 font-medium">Page Not Found</p>
                                <button 
                                    onClick={() => window.location.href = '/'}
                                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                                >
                                    Return Home
                                </button>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
