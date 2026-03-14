import React, { useEffect, useState } from 'react';
import { renderMolecule } from '../services/api';

interface Props {
    smiles: string;
}

const MoleculeRenderer: React.FC<Props> = ({ smiles }) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!smiles) return;

        const fetchImage = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await renderMolecule(smiles);
                setImage(res.image);
            } catch (err) {
                setError('Failed to render molecule');
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [smiles]);

    if (!smiles) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-center justify-center min-h-[300px] text-gray-400">
                Waiting for input...
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col items-center min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 w-full text-left border-b pb-2">2D Structure</h2>
            {error ? (
                <div className="text-red-500 flex-1 flex items-center m-auto">{error}</div>
            ) : (
                image && (
                    <img
                        src={`data:image/png;base64,${image}`}
                        alt={`2D render of ${smiles}`}
                        className="flex-1 object-contain max-h-[250px] w-full mt-2 filter mix-blend-multiply"
                    />
                )
            )}
        </div>
    );
};

export default MoleculeRenderer;
