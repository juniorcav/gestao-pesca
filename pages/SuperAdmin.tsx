
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../types';
import { Building2, Search, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

// MOCK DATA FOR DEMO - In real app, fetch from 'businesses' table
const MOCK_BUSINESSES: Business[] = [
    { id: '1', name: 'Pousada do Rio', ownerId: 'user-1', plan: 'pro', status: 'active', createdAt: '2023-01-15' },
    { id: '2', name: 'Hotel Fazenda Pantanal', ownerId: 'user-2', plan: 'enterprise', status: 'active', createdAt: '2023-02-20' },
    { id: '3', name: 'Barcos & Pesca Ltda', ownerId: 'user-3', plan: 'free', status: 'suspended', createdAt: '2023-03-10' },
];

const SuperAdmin = () => {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = businesses.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const toggleStatus = (id: string) => {
        setBusinesses(prev => prev.map(b => {
            if (b.id === id) return { ...b, status: b.status === 'active' ? 'suspended' : 'active' };
            return b;
        }));
    };

    if (user?.role !== 'platform_admin') {
        return <div className="p-8 text-center">Acesso restrito ao Administrador da Plataforma.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Building2 className="text-nature-600" />
                        Gestão de Empresas (SaaS)
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Administre os clientes da plataforma.</p>
                </div>
                <button className="bg-nature-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-nature-700 shadow-sm">
                    <Plus size={20} /> Nova Empresa
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Total Empresas</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{businesses.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Ativas</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{businesses.filter(b => b.status === 'active').length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Suspensas</h3>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{businesses.filter(b => b.status === 'suspended').length}</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-nature-500"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Empresa</th>
                            <th className="p-4">Plano</th>
                            <th className="p-4">Data Cadastro</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                        {filtered.map(business => (
                            <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4 font-bold text-gray-800 dark:text-white">{business.name}</td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-2 py-1 rounded text-xs uppercase font-bold">
                                        {business.plan}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500 dark:text-gray-400">{business.createdAt}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1 font-bold text-xs uppercase ${business.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                        {business.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                        {business.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => toggleStatus(business.id)}
                                        className="text-gray-500 hover:text-nature-600 dark:hover:text-nature-400 mr-2"
                                    >
                                        {business.status === 'active' ? 'Suspender' : 'Ativar'}
                                    </button>
                                    <button className="text-red-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdmin;
