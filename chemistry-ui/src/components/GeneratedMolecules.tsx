import React, { useEffect, useState } from 'react';
import { getMoleculeProperties, renderMolecule, type MoleculeProperties as IProps } from '../services/api';

interface MoleculeCardProps {
    smiles: string;
}

const MoleculeCard: React.FC<MoleculeCardProps> = ({ smiles }) => {
    const [props, setProps] = useState<IProps | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [propRes, imgRes] = await Promise.all([
                    getMoleculeProperties(smiles),
                    renderMolecule(smiles)
                ]);
                setProps(propRes.properties);
                setImage(imgRes.image);
            } catch (err) {
                console.error("Failed to load data for", smiles);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [smiles]);

    if (loading) {
        return (
            <div className="border border-gray-200 rounded-lg p-4 animate-pulse flex items-center justify-center h-32 bg-gray-50">
                <span className="text-gray-400">Loading {smiles}...</span>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col sm:flex-row shadow-sm hover:shadow-md transition">
            <div className="w-full sm:w-1/3 bg-gray-50 flex items-center justify-center p-2 border-r border-gray-100 min-h-[150px]">
                {image ? (
                    <img src={`data:image/png;base64,${image}`} alt="Molecule" className="w-full h-auto object-contain max-h-32 filter mix-blend-multiply" />
                ) : (
                    <span className="text-red-400">Fail</span>
                )}
            </div>
            <div className="w-full sm:w-2/3 p-4 flex flex-col justify-center">
                <div className="text-lg font-mono text-gray-800 break-all mb-3 font-semibold border-b pb-2">{smiles}</div>
                <div className="flex space-x-6 text-sm">
                    <div>
                        <span className="text-gray-500 uppercase tracking-widest text-xs block">Weight</span>
                        <span className="font-medium text-gray-800">{props?.mw.toFixed(2)} Da</span>
                    </div>
                    <div>
                        <span className="text-gray-500 uppercase tracking-widest text-xs block">LogP</span>
                        <span className="font-medium text-gray-800">{props?.logp.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface GeneratedListProps {
    molecules: string[];
}

const GeneratedMolecules: React.FC<GeneratedListProps> = ({ molecules }) => {
    if (!molecules || molecules.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 w-full mt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Generated Candidates ({molecules.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {molecules.map((smiles, idx) => (
                    <MoleculeCard key={idx} smiles={smiles} />
                ))}
            </div>
        </div>
    );
};

export default GeneratedMolecules;
