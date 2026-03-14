import React, { useState } from 'react';
import { validateMolecule } from '../services/api';

interface Props {
    onMoleculeValid: (smiles: string) => void;
}

const MoleculeInput: React.FC<Props> = ({ onMoleculeValid }) => {
    const [smiles, setSmiles] = useState('');
    const [status, setStatus] = useState<{ message: string; isValid: boolean | null }>({
        message: '',
        isValid: null,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!smiles.trim()) return;

        setLoading(true);
        setStatus({ message: '', isValid: null });

        try {
            const response = await validateMolecule(smiles);
            if (response.is_valid) {
                setStatus({ message: 'Valid Molecule ✓', isValid: true });
                onMoleculeValid(smiles);
            } else {
                setStatus({ message: 'Invalid SMILES Structure ✗', isValid: false });
            }
        } catch (error) {
            setStatus({ message: 'Error validating molecule.', isValid: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Molecular Input</h2>
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
                <input
                    type="text"
                    value={smiles}
                    onChange={(e) => setSmiles(e.target.value)}
                    placeholder="Enter SMILES string (e.g., CCO)"
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                />
                <button
                    type="submit"
                    disabled={loading || !smiles.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                    {loading ? 'Validating...' : 'Validate & Process'}
                </button>
            </form>

            {status.isValid !== null && (
                <div
                    className={`mt-4 px-4 py-2 rounded-md w-full max-w-md text-center font-medium ${status.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {status.message}
                </div>
            )}
        </div>
    );
};

export default MoleculeInput;
