import React, { useEffect, useState } from 'react';
import { getMoleculeProperties, type MoleculeProperties as IProps } from '../services/api';

interface Props {
    smiles: string;
}

const MoleculeProperties: React.FC<Props> = ({ smiles }) => {
    const [properties, setProperties] = useState<IProps | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!smiles) return;

        const fetchProperties = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getMoleculeProperties(smiles);
                setProperties(res.properties);
            } catch (err) {
                setError('Failed to fetch properties');
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [smiles]);

    if (!smiles) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-center justify-center min-h-[200px] text-gray-400">
                Enter a valid molecule to see properties.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex items-center justify-center min-h-[200px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-red-100 text-red-500 text-center flex items-center justify-center min-h-[200px]">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Properties</h2>

            {properties && (
                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">Molecular Wt</span>
                        <span className="text-lg font-medium text-gray-800">{properties.mw} Da</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">LogP</span>
                        <span className="text-lg font-medium text-gray-800">{properties.logp}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">H-Bond Donors</span>
                        <span className="text-lg font-medium text-gray-800">{properties.hbd}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">H-Bond Acceptors</span>
                        <span className="text-lg font-medium text-gray-800">{properties.hba}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">TPSA</span>
                        <span className="text-lg font-medium text-gray-800">{properties.tpsa} Å²</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                        <span className="block text-xs text-gray-500 uppercase font-semibold">Rotatable Bonds</span>
                        <span className="text-lg font-medium text-gray-800">{properties.rotatable_bonds}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoleculeProperties;
