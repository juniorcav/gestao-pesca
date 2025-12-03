import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Plus, Trash2, Edit2, Package, Anchor, BedDouble, User, FileText, Camera } from 'lucide-react';

type Tab = 'rooms' | 'boats' | 'guides' | 'products' | 'budget_templates';

const Resources = () => {
  const { rooms, boats, guides, products, budgetTemplates, deleteResource, addResource, updateResource } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('budget_templates');
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        let type = activeTab === 'rooms' ? 'room' : 
                   activeTab === 'boats' ? 'boat' : 
                   activeTab === 'guides' ? 'guide' : 
                   activeTab === 'products' ? 'product' : 'budget_template';
        deleteResource(type as any, id);
    }
  };

  const handleEdit = (item: any) => {
      setFormState({ ...item });
      setEditingId(item.id);
      setShowModal(true);
  };

  const handleAddNew = () => {
      setFormState({});
      setEditingId(null);
      setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let type = activeTab === 'rooms' ? 'room' : 
               activeTab === 'boats' ? 'boat' : 
               activeTab === 'guides' ? 'guide' : 
               activeTab === 'products' ? 'product' : 'budget_template';

    const itemData = { ...formState };
    
    // Ensure numbers
    if (activeTab === 'products' || activeTab === 'budget_templates') {
        itemData.price = parseFloat(itemData.price) || 0;
    }
    if (activeTab === 'products') {
        itemData.stock = Number(itemData.stock || 0);
    }
    if (activeTab === 'rooms') {
        itemData.capacity = Number(itemData.capacity || 2);
    }
    if (activeTab === 'boats') {
        itemData.capacity = Number(itemData.capacity || 2);
    }

    if (editingId) {
        updateResource(type as any, editingId, itemData);
    } else {
        const newItem = {
            ...itemData,
            id: Math.random().toString(36).substr(2, 9),
            status: itemData.status || 'available'
        };
        addResource(type as any, newItem);
    }
    
    setShowModal(false);
    setFormState({});
    setEditingId(null);
  };

  const renderList = () => {
    switch(activeTab) {
      case 'budget_templates':
        return (
             <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-nature-50 dark:bg-nature-900/30">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-bold text-nature-800 dark:text-nature-300 uppercase tracking-wider">Nome do Item</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-nature-800 dark:text-nature-300 uppercase tracking-wider">Descrição</th>
                             <th className="px-6 py-3 text-left text-xs font-bold text-nature-800 dark:text-nature-300 uppercase tracking-wider">Valor Padrão</th>
                             <th className="px-6 py-3 text-right text-xs font-bold text-nature-800 dark:text-nature-300 uppercase tracking-wider">Ações</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                         {budgetTemplates.map(item => (
                             <tr key={item.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                 <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{item.description}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">R$ {item.price.toFixed(2)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"><Edit2 size={16}/></button>
                                     <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={16}/></button>
                                 </td>
                             </tr>
                         ))}
                         {budgetTemplates.length === 0 && (
                             <tr><td colSpan={4} className="p-6 text-center text-gray-500 dark:text-gray-400">Nenhum modelo de item cadastrado.</td></tr>
                         )}
                     </tbody>
                 </table>
             </div>
        );
      case 'rooms':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative group transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-nature-100 dark:bg-nature-900 text-nature-800 dark:text-nature-200 font-bold px-2 py-1 rounded text-xs">#{room.number}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{room.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${room.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {room.status === 'available' ? 'Livre' : 'Ocupado'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 h-10 overflow-hidden">{room.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1"><User size={14}/> Máx: {room.capacity}</div>
                  <div className="flex space-x-2">
                     <button onClick={() => handleEdit(room)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16} /></button>
                     <button onClick={() => handleDelete(room.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'boats':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boats.map(boat => (
                <div key={boat.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold px-2 py-1 rounded text-xs">#{boat.number}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{boat.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${boat.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {boat.status === 'available' ? 'Disp.' : 'Uso'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1">
                      <p>Motor: {boat.motorPower}</p>
                      <p className="italic">{boat.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1"><User size={14}/> Cap: {boat.capacity}</div>
                    <div className="flex space-x-2">
                        <button onClick={() => handleEdit(boat)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(boat.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
      case 'guides':
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map(guide => (
                <div key={guide.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          {guide.photoUrl ? <img src={guide.photoUrl} alt={guide.name} className="h-full w-full object-cover" /> : <User className="text-gray-400 dark:text-gray-500" />}
                      </div>
                      <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{guide.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{guide.specialty}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${guide.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
                        {guide.status === 'available' ? 'Livre' : 'Ocupado'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <p><strong>WhatsApp:</strong> {guide.whatsapp || '-'}</p>
                      <p><strong>CPF:</strong> {guide.cpf || '-'}</p>
                      <p><strong>Endereço:</strong> {guide.address || '-'}</p>
                  </div>
                  <div className="flex justify-end items-center text-sm text-gray-600 dark:text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 space-x-2">
                    <button onClick={() => handleEdit(guide)} className="text-blue-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(guide.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          );
      case 'products':
         return (
             <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estoque</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                         {products.map(product => (
                             <tr key={product.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">R$ {product.price.toFixed(2)}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.stock}</td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                     <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Editar</button>
                                     <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         );
    }
  };

  const getModalFields = () => {
     switch(activeTab) {
        case 'budget_templates':
            return (
                <>
                  <label className="label">Nome do Item</label>
                  <input required placeholder="Ex: Diária Completa" className="input-field mb-3" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} />
                  
                  <label className="label">Descrição Detalhada</label>
                  <textarea placeholder="O que está incluso..." className="input-field mb-3" rows={3} value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} />
                  
                  <label className="label">Valor Padrão (R$)</label>
                  <input required type="number" step="0.01" className="input-field" value={formState.price || ''} onChange={e => setFormState({...formState, price: e.target.value})} />
                </>
            );
        case 'rooms':
           return (
              <>
                <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="col-span-1">
                        <label className="label">Nº</label>
                        <input required placeholder="101" className="input-field" value={formState.number || ''} onChange={e => setFormState({...formState, number: e.target.value})} />
                    </div>
                    <div className="col-span-3">
                        <label className="label">Nome do Quarto</label>
                        <input required placeholder="Suíte Master" className="input-field" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} />
                    </div>
                </div>
                
                <label className="label">Capacidade (Pessoas)</label>
                <select className="input-field mb-3" value={formState.capacity || 2} onChange={e => setFormState({...formState, capacity: e.target.value})}>
                    {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Pessoas</option>)}
                </select>

                <label className="label">Descrição</label>
                <textarea placeholder="Vista, Ar condicionado..." className="input-field" value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} />
              </>
           );
        case 'boats':
           return (
              <>
                 <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="col-span-1">
                        <label className="label">Nº</label>
                        <input required placeholder="01" className="input-field" value={formState.number || ''} onChange={e => setFormState({...formState, number: e.target.value})} />
                    </div>
                    <div className="col-span-3">
                        <label className="label">Nome da Embarcação</label>
                        <input required placeholder="Bass Boat" className="input-field" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="label">Motorização</label>
                        <input required placeholder="Ex: 115 HP" className="input-field" value={formState.motorPower || ''} onChange={e => setFormState({...formState, motorPower: e.target.value})} />
                    </div>
                    <div>
                        <label className="label">Tipo</label>
                        <input required placeholder="Ex: Alumínio" className="input-field" value={formState.type || ''} onChange={e => setFormState({...formState, type: e.target.value})} />
                    </div>
                 </div>

                 <label className="label">Descrição</label>
                 <textarea placeholder="Detalhes do barco..." className="input-field" value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} />
              </>
           );
        case 'guides':
            return (
               <>
                  <label className="label">Nome Completo</label>
                  <input required placeholder="Nome do Guia" className="input-field mb-3" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                          <label className="label">WhatsApp</label>
                          <input placeholder="Apenas números" className="input-field" value={formState.whatsapp || ''} onChange={e => setFormState({...formState, whatsapp: e.target.value})} />
                      </div>
                      <div>
                          <label className="label">CPF</label>
                          <input placeholder="000.000.000-00" className="input-field" value={formState.cpf || ''} onChange={e => setFormState({...formState, cpf: e.target.value})} />
                      </div>
                  </div>

                  <label className="label">Endereço</label>
                  <input placeholder="Rua, Número, Bairro" className="input-field mb-3" value={formState.address || ''} onChange={e => setFormState({...formState, address: e.target.value})} />
                  
                  <label className="label">Especialidade</label>
                  <input required placeholder="Ex: Peixes de couro" className="input-field mb-3" value={formState.specialty || ''} onChange={e => setFormState({...formState, specialty: e.target.value})} />

                  <label className="label">Foto (URL Simulada)</label>
                  <div className="flex gap-2">
                     <input placeholder="http://..." className="input-field flex-1" value={formState.photoUrl || ''} onChange={e => setFormState({...formState, photoUrl: e.target.value})} />
                     <button type="button" className="bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"><Camera size={20} className="text-gray-500 dark:text-gray-400"/></button>
                  </div>
               </>
            );
        case 'products':
            return (
               <>
                  <label className="label">Nome do Produto</label>
                  <input required className="input-field mb-3" value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} />
                  
                  <label className="label">Categoria</label>
                  <input required className="input-field mb-3" value={formState.category || ''} onChange={e => setFormState({...formState, category: e.target.value})} />
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="label">Preço (R$)</label>
                        <input required type="number" step="0.01" className="input-field" value={formState.price || ''} onChange={e => setFormState({...formState, price: e.target.value})} />
                     </div>
                     <div>
                        <label className="label">Estoque Inicial</label>
                        <input required type="number" className="input-field" value={formState.stock || ''} onChange={e => setFormState({...formState, stock: e.target.value})} />
                     </div>
                  </div>
               </>
            );
     }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cadastros e Recursos</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie itens de orçamento, quartos, barcos e equipe.</p>
        </div>
        <button 
           onClick={handleAddNew}
           className="bg-nature-600 hover:bg-nature-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Adicionar Novo
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'budget_templates', label: 'Itens de Orçamento', icon: FileText },
            { id: 'rooms', label: 'Quartos', icon: BedDouble },
            { id: 'boats', label: 'Barcos', icon: Anchor },
            { id: 'guides', label: 'Guias', icon: User },
            { id: 'products', label: 'Loja / Consumo', icon: Package },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-nature-600 text-nature-700 dark:text-nature-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'}
              `}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {renderList()}

      {/* Generic Modal */}
      {showModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 transition-colors">
                 <h3 className="text-lg font-bold mb-4 capitalize text-gray-900 dark:text-white">
                    {editingId ? 'Editar Item' : 'Adicionar Novo'}
                 </h3>
                 <form onSubmit={handleSave}>
                     {getModalFields()}
                     <div className="flex justify-end space-x-3 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
                         <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Cancelar</button>
                         <button type="submit" className="px-4 py-2 text-sm bg-nature-600 text-white rounded hover:bg-nature-700">Salvar</button>
                     </div>
                 </form>
             </div>
         </div>
      )}

      <style>{`
         .label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            color: #4b5563;
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.025em;
         }
         .dark .label { color: #9ca3af; }
         .input-field {
            width: 100%;
            padding: 0.6rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            outline: none;
            color: #1f2937;
            background-color: #f9fafb;
            font-size: 0.875rem;
            transition: all 0.2s;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
         }
         .dark .input-field {
            background-color: #374151;
            border-color: #4b5563;
            color: #f3f4f6;
         }
         .input-field:focus {
            border-color: #16a34a;
            background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
         }
         .dark .input-field:focus {
            background-color: #1f2937;
         }
      `}</style>
    </div>
  );
};

export default Resources;