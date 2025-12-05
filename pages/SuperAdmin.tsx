import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Business, Plan } from '../types';
import { Building2, Search, Plus, Trash2, CheckCircle, XCircle, Edit2, X, Save, Settings, Layers, CreditCard, Palette, Upload } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { COLOR_PALETTES } from '../constants';

type AdminTab = 'businesses' | 'plans' | 'settings';

const SuperAdmin = () => {
    const { user } = useAuth();
    const { 
        businesses, addBusiness, updateBusiness, deleteBusiness,
        plans, addPlan, updatePlan, deletePlan,
        platformSettings, updatePlatformSettings
    } = useApp();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('businesses');
    const [searchTerm, setSearchTerm] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    
    // Extra Protection Layer
    if (user?.role !== 'platform_admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // --- Business Modal ---
    const [showBusModal, setShowBusModal] = useState(false);
    const [editingBusId, setEditingBusId] = useState<string | null>(null);
    const [busFormData, setBusFormData] = useState<Partial<Business>>({ name: '', plan: 'free', status: 'active' });

    // --- Plan Modal ---
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [planFormData, setPlanFormData] = useState<Partial<Plan>>({ name: '', price: 0, features: [], active: true });
    const [featureInput, setFeatureInput] = useState('');

    // --- Business Handlers ---
    const filteredBus = businesses.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSaveBus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!busFormData.name) return;
        if (editingBusId) {
            const existing = businesses.find(b => b.id === editingBusId);
            if (existing) updateBusiness({ ...existing, name: busFormData.name!, plan: busFormData.plan as any, status: busFormData.status as any });
        } else {
            addBusiness({
                id: Math.random().toString(36).substr(2, 9),
                name: busFormData.name!,
                ownerId: 'new-' + Math.random().toString(36).substr(2, 5),
                plan: busFormData.plan as any,
                status: busFormData.status as any,
                createdAt: new Date().toISOString().split('T')[0]
            });
        }
        setShowBusModal(false);
    };

    // --- Plan Handlers ---
    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planFormData.name) return;
        const features = planFormData.features || [];
        
        if (editingPlanId) {
            const existing = plans.find(p => p.id === editingPlanId);
            if (existing) updatePlan({ ...existing, name: planFormData.name!, price: planFormData.price!, features, active: planFormData.active! });
        } else {
            addPlan({
                id: Math.random().toString(36).substr(2, 9),
                name: planFormData.name!,
                price: planFormData.price || 0,
                features,
                active: planFormData.active !== undefined ? planFormData.active : true
            });
        }
        setShowPlanModal(false);
    };

    const addFeature = () => {
        if (!featureInput) return;
        setPlanFormData(prev => ({ ...prev, features: [...(prev.features || []), featureInput] }));
        setFeatureInput('');
    };

    const removeFeature = (idx: number) => {
        setPlanFormData(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== idx) }));
    };

    // --- Settings Handlers ---
    const [settingsForm, setSettingsForm] = useState(platformSettings);
    
    // Sync settings form when global settings load
    React.useEffect(() => {
        setSettingsForm(platformSettings);
    }, [platformSettings]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            await updatePlatformSettings(settingsForm);
            alert("Configurações salvas com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar configurações.");
        } finally {
            setSavingSettings(false);
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettingsForm(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Building2 className="text-nature-600" />
                        Painel Admin (SaaS)
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Administre clientes, planos e a plataforma.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'businesses', label: 'Empresas', icon: Building2 },
                        { id: 'plans', label: 'Planos de Assinatura', icon: CreditCard },
                        { id: 'settings', label: 'Configurações da Plataforma', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                ${activeTab === tab.id
                                    ? 'border-nature-600 text-nature-600 dark:text-nature-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                            `}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* --- TAB CONTENT: BUSINESSES --- */}
            {activeTab === 'businesses' && (
                <>
                    <div className="flex justify-end">
                        <button onClick={() => { setBusFormData({}); setEditingBusId(null); setShowBusModal(true); }} className="bg-nature-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-nature-700 shadow-sm">
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
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Receita Estimada</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                                R$ {businesses.reduce((acc, b) => {
                                    const plan = plans.find(p => p.name.toLowerCase() === b.plan);
                                    return acc + (plan ? plan.price : 0);
                                }, 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg outline-none text-gray-900 dark:text-white" placeholder="Buscar empresa..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Empresa</th>
                                    <th className="p-4">Plano</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {filteredBus.map(business => (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 font-bold text-gray-800 dark:text-white">{business.name}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded text-xs uppercase font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{business.plan}</span></td>
                                        <td className="p-4"><span className={`flex items-center gap-1 font-bold text-xs uppercase ${business.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>{business.status}</span></td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => { setBusFormData(business); setEditingBusId(business.id); setShowBusModal(true); }} className="text-blue-400 hover:text-blue-600 mr-2"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteBusiness(business.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* --- TAB CONTENT: PLANS --- */}
            {activeTab === 'plans' && (
                <>
                    <div className="flex justify-end">
                        <button onClick={() => { setPlanFormData({features:[], active: true}); setEditingPlanId(null); setShowPlanModal(true); }} className="bg-nature-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-nature-700 shadow-sm">
                            <Plus size={20} /> Novo Plano
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all ${plan.active ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 opacity-75'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setPlanFormData(plan); setEditingPlanId(plan.id); setShowPlanModal(true); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16}/></button>
                                        <button onClick={() => deletePlan(plan.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-nature-600 mb-6">
                                    R$ {plan.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    <span className="text-sm text-gray-400 font-normal"> / mês</span>
                                </p>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <CheckCircle size={14} className="text-green-500"/> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <div className={`text-center text-xs font-bold uppercase py-1 rounded ${plan.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {plan.active ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* --- TAB CONTENT: SETTINGS --- */}
            {activeTab === 'settings' && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-b dark:border-gray-700 pb-2">Identidade Visual da Plataforma</h3>
                    <form onSubmit={handleSaveSettings} className="space-y-8">
                        {/* Branding */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nome do Aplicativo</label>
                                <input 
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={settingsForm.appName}
                                    onChange={e => setSettingsForm({...settingsForm, appName: e.target.value})}
                                />
                                <p className="text-xs text-gray-400 mt-1">Exibido no título e rodapés.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Logotipo</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600 overflow-hidden">
                                        {settingsForm.logoUrl ? <img src={settingsForm.logoUrl} className="h-full w-full object-contain" /> : <Layers size={24} className="text-gray-400"/>}
                                    </div>
                                    <label className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2">
                                        <Upload size={16}/> Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Theme Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Palette size={18} /> Tema & Cores
                            </label>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                {COLOR_PALETTES.map((palette) => (
                                    <button
                                        key={palette.hex}
                                        type="button"
                                        onClick={() => setSettingsForm({ ...settingsForm, primaryColor: palette.hex })}
                                        className={`group relative flex flex-col items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                            settingsForm.primaryColor?.toLowerCase() === palette.hex.toLowerCase()
                                                ? 'border-nature-600 bg-nature-50 dark:bg-nature-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        <div 
                                            className="w-full h-12 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                            style={{ backgroundColor: palette.hex }}
                                        />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 text-center">
                                            {palette.name}
                                        </span>
                                        {settingsForm.primaryColor?.toLowerCase() === palette.hex.toLowerCase() && (
                                            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full text-nature-600 shadow-md p-0.5">
                                                <CheckCircle size={20} className="fill-white dark:fill-gray-800" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                <span className="text-sm text-gray-500 font-medium">Cor Personalizada:</span>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="color" 
                                        className="h-9 w-14 cursor-pointer rounded border border-gray-300 p-0.5 bg-white"
                                        value={settingsForm.primaryColor || '#16a34a'}
                                        onChange={e => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                                    />
                                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                        {settingsForm.primaryColor}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t dark:border-gray-700 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={savingSettings}
                                className="bg-nature-600 hover:bg-nature-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-nature-200 dark:shadow-none transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {savingSettings ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18}/> Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODALS */}
            {showBusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white">Nova Empresa</h3>
                            <button onClick={() => setShowBusModal(false)}><X className="text-gray-400" size={20}/></button>
                        </div>
                        <input className="w-full mb-3 p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Nome da Empresa" value={busFormData.name} onChange={e => setBusFormData({...busFormData, name: e.target.value})} />
                        <select className="w-full mb-4 p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={busFormData.plan} onChange={e => setBusFormData({...busFormData, plan: e.target.value as any})}>
                            {plans.map(p => <option key={p.id} value={p.name.toLowerCase()}>{p.name}</option>)}
                            <option value="free">Free</option>
                        </select>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowBusModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveBus} className="px-6 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold">Criar</button>
                        </div>
                    </div>
                </div>
            )}

            {showPlanModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold dark:text-white">Plano de Assinatura</h3>
                            <button onClick={() => setShowPlanModal(false)}><X className="text-gray-400" size={20}/></button>
                        </div>
                        <input className="w-full mb-3 p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Nome do Plano" value={planFormData.name} onChange={e => setPlanFormData({...planFormData, name: e.target.value})} />
                        <input className="w-full mb-3 p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" type="number" placeholder="Preço (R$)" value={planFormData.price} onChange={e => setPlanFormData({...planFormData, price: parseFloat(e.target.value)})} />
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold mb-2 text-gray-500 uppercase">Funcionalidades</label>
                            <div className="flex gap-2 mb-2">
                                <input className="flex-1 p-2 border dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white" placeholder="Ex: CRM Ilimitado" value={featureInput} onChange={e => setFeatureInput(e.target.value)} />
                                <button onClick={addFeature} type="button" className="px-3 bg-nature-100 text-nature-700 rounded-lg hover:bg-nature-200 font-bold">+</button>
                            </div>
                            <ul className="space-y-1 max-h-32 overflow-y-auto">
                                {planFormData.features?.map((f, i) => (
                                    <li key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600 dark:text-gray-300">
                                        {f} <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSavePlan} className="px-6 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;