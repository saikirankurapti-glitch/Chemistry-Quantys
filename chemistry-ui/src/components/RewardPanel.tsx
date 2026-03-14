import React from 'react';
import { type ScoredMolecule } from '../services/api';

interface Props {
    molecules: ScoredMolecule[];
}

const RewardPanel: React.FC<Props> = ({ molecules }) => {
    if (!molecules || molecules.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 w-full mt-10">
            <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">AI Reward Rankings</h2>
                <p className="text-sm text-gray-500">Molecules ordered by their theoretical binding, novelty, ADMET profile, and drug-likeness fitness scores.</p>
            </div>

            <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm text-left text-gray-700 shadow-sm border border-gray-100 rounded-lg overflow-hidden">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4 font-mono">Molecule (SMILES)</th>
                            <th className="px-6 py-4 text-emerald-600">Final Score</th>
                            <th className="px-6 py-4">Drug-Likeness</th>
                            <th className="px-6 py-4">Weight (MW)</th>
                            <th className="px-6 py-4">LogP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {molecules.map((mol, idx) => (
                            <tr key={idx} className={`border-b transition-colors hover:bg-emerald-50 ${idx === 0 ? 'bg-emerald-50/50' : 'bg-white'}`}>
                                <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-50">
                                    {idx === 0 ? '🏆 #1' : `#${idx + 1}`}
                                </td>
                                <td className="px-6 py-4 font-mono break-all font-medium text-gray-800">{mol.smiles}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600 text-base">{mol.score.toFixed(4)}</td>
                                <td className="px-6 py-4">{mol.drug_likeness.toFixed(2)}</td>
                                <td className="px-6 py-4">{mol.mw.toFixed(2)} Da</td>
                                <td className="px-6 py-4">{mol.logp.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RewardPanel;
