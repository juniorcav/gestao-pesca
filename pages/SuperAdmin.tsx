
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Business } from '../types';
import { Building2, Search, Plus, Trash2, CheckCircle, XCircle, Edit2, X, Save } from 'lucide-react';

const SuperAdmin = () => {
    // Removed useAuth usage
    const { businesses, addBusiness, updateBusiness, deleteBusiness } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Business>>({
        name: '',
        plan: 'free',
        status: 'active'
    });

    const filtered = businesses.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const toggleStatus = (id: string) => {
        const business = businesses.find(b => b.id === id);
        if (business) {
            updateBusiness({
                ...business,
                status: business.status === 'active' ? 'suspended' : 'active'
            });
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta empresa? Esta ação é irreversível.")) {
            deleteBusiness(id);
        }
    };

    const handleEdit = (business: Business) => {
        setFormData({
            name: business.name,
            plan: business.plan,
            status: business.status
        });
        setEditingId(business.id);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setFormData({
            name: '',
            plan: 'free',
            status: 'active'
        });
        setEditingId(null);
        setShowModal(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name) return alert("O nome da empresa é obrigatório");

        if (editingId) {
            const existing = businesses.find(b => b.id === editingId);
            if (existing) {
                updateBusiness({
                    ...existing,
                    name: formData.name!,
                    plan: formData.plan as any,
                    status: formData.status as any
                });
            }
        } else {
            const newBusiness: Business = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name!,
                ownerId: 'new-owner-' + Math.random().toString(36).substr(2, 5),
                plan: formData.plan as any,
                status: formData.status as any,
                createdAt: new Date().toISOString().split('T')[0]
            };
            addBusiness(newBusiness);
        }
        setShowModal(false);
    };

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
                <button 
                    onClick={handleAddNew}
                    className="bg-nature-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-nature-700 shadow-sm transition-colors"
                >
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-nature-500 focus:ring-1 focus:ring-nature-500 transition-colors text-gray-900 dark:text-white placeholder-gray-500"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase font-bold">
                            <tr>
                                <th className="p-4 whitespace-nowrap">Empresa</th>
                                <th className="p-4 whitespace-nowrap">Plano</th>
                                <th className="p-4 whitespace-nowrap">Data Cadastro</th>
                                <th className="p-4 whitespace-nowrap">Status</th>
                                <th className="p-4 text-right whitespace-nowrap">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filtered.map(business => (
                                <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-bold text-gray-800 dark:text-white">{business.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                            business.plan === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                                            business.plan === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {business.plan}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-500 dark:text-gray-400">{business.createdAt}</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 font-bold text-xs uppercase ${business.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {business.status === 'active' ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                                            {business.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <button 
                                            onClick={() => toggleStatus(business.id)}
                                            className="text-gray-500 hover:text-nature-600 dark:text-gray-400 dark:hover:text-nature-400 mr-3 text-xs uppercase font-bold"
                                        >
                                            {business.status === 'active' ? 'Suspender' : 'Ativar'}
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(business)}
                                            className="text-blue-400 hover:text-blue-600 mr-2 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(business.id)}
                                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">Nenhuma empresa encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {editingId ? 'Editar Empresa' : 'Nova Empresa'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                                <input 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: Pousada Exemplo"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Plano</label>
                                <select 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none transition-all"
                                    value={formData.plan}
                                    onChange={e => setFormData({...formData, plan: e.target.value as any})}
                                >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Status Inicial</label>
                                <select 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none transition-all"
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                                >
                                    <option value="active">Ativo</option>
                                    <option value="suspended">Suspenso</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
                                >
                                    <Save size={18} /> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;
