
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Upload, Save, MapPin, Fish, Briefcase, Info, Image as ImageIcon, Video, Trash2, Plus, Sparkles, FileText, CheckCircle, Users, UserPlus, X, Copy, ExternalLink } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SERVICE_OPTIONS = [
  "Pousada Completa",
  "Barcos e Piloteiros",
  "Guia de Pesca",
  "Pacotes All Inclusive",
  "Venda de Equipamentos",
  "Restaurante / Bar",
  "Aluguel de Lanchas",
  "Ecoturismo"
];

const Settings = () => {
  const { config, updateConfig, teamMembers, addTeamMember, removeTeamMember } = useApp();
  const { user } = useAuth();
  const [localConfig, setLocalConfig] = useState(config);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'equipe'>('geral');
  
  // Team Form State
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const location = useLocation();
  const isFirstSetup = location.state?.firstSetup;

  // Sincroniza o formulário local quando os dados do banco (contexto) são carregados
  useEffect(() => {
    if (config) {
        setLocalConfig(config);
    }
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newMember.name || !newMember.email) return;
      
      const res = await addTeamMember({
          name: newMember.name,
          email: newMember.email
      });

      if(res.success && res.inviteLink) {
          setInviteLink(res.inviteLink);
          // setShowAddMember(false); // Keep open to show link
          setNewMember({ name: '', email: '' });
      } else {
          alert(res.message);
      }
  };

  const copyToClipboard = () => {
      if (inviteLink) {
          navigator.clipboard.writeText(inviteLink);
          alert("Link copiado para a área de transferência!");
      }
  };

  const closeInviteModal = () => {
      setInviteLink(null);
      setShowAddMember(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalConfig({ ...localConfig, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const promises: Promise<string>[] = [];
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            promises.push(new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file as Blob);
            }));
        });

        Promise.all(promises).then(images => {
            setLocalConfig(prev => ({
                ...prev,
                galleryImages: [...(prev.galleryImages || []), ...images]
            }));
        });
    }
  };

  const handleRemoveImage = (index: number) => {
      const imgToRemove = localConfig.galleryImages?.[index];
      const newImages = [...(localConfig.galleryImages || [])];
      newImages.splice(index, 1);
      
      // Also remove from PDF images if present
      let newPdfImages = localConfig.pdfImages || [];
      if (imgToRemove) {
          newPdfImages = newPdfImages.filter(img => img !== imgToRemove);
      }

      setLocalConfig({...localConfig, galleryImages: newImages, pdfImages: newPdfImages});
  };

  const togglePdfImage = (imgUrl: string) => {
      const currentPdfImages = localConfig.pdfImages || [];
      
      if (currentPdfImages.includes(imgUrl)) {
          // Remove
          setLocalConfig({
              ...localConfig, 
              pdfImages: currentPdfImages.filter(i => i !== imgUrl)
          });
      } else {
          // Add (Max 10)
          if (currentPdfImages.length >= 10) return;
          setLocalConfig({
              ...localConfig,
              pdfImages: [...currentPdfImages, imgUrl]
          });
      }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setLocalConfig({ ...localConfig, promotionalVideo: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const toggleService = (service: string) => {
    const current = localConfig.services || [];
    if (current.includes(service)) {
      setLocalConfig({ ...localConfig, services: current.filter(s => s !== service) });
    } else {
      setLocalConfig({ ...localConfig, services: [...current, service] });
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 text-gray-800 dark:text-gray-100 shadow-sm focus:bg-white dark:focus:bg-gray-800 focus:border-nature-500 focus:ring-2 focus:ring-nature-200 dark:focus:ring-nature-800 outline-none transition-all";
  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1";

  const usageCount = teamMembers.length;
  const usageLimit = 6; 

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Welcome Banner for First Setup */}
      {isFirstSetup && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-xl animate-fade-in-up">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-4">
                    <h3 className="text-lg leading-6 font-bold text-blue-800 dark:text-blue-300">
                        Bem-vindo ao PescaGestor Pro!
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                        <p>
                            Para começar com o pé direito, <strong>configure os dados do seu negócio abaixo</strong>. 
                        </p>
                        <p className="mt-1">
                            Essas informações serão usadas nos <strong>Orçamentos em PDF</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie dados do negócio e equipe</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('geral')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === 'geral'
                  ? 'border-nature-600 text-nature-600 dark:text-nature-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              <Briefcase size={18} />
              Dados do Negócio
            </button>
            <button
              onClick={() => setActiveTab('equipe')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === 'equipe'
                  ? 'border-nature-600 text-nature-600 dark:text-nature-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
              `}
            >
              <Users size={18} />
              Equipe e Acesso
            </button>
          </nav>
      </div>
      
      {/* --- TAB: GERAL --- */}
      {activeTab === 'geral' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <form onSubmit={handleSave} className="space-y-8">
                {/* SECTION 1: IDENTITY */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Logo Upload */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="relative h-32 w-32 mb-4 bg-white dark:bg-gray-600 rounded-lg shadow-sm flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-500">
                        {localConfig.logoUrl ? (
                        <img src={localConfig.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                        <ImageIcon size={48} className="text-gray-300 dark:text-gray-400" />
                        )}
                    </div>
                    <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                        <Upload size={16} />
                        Alterar Logotipo
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    <p className="text-xs text-gray-400 mt-2 text-center">Recomendado: 500x500px (PNG/JPG)</p>
                </div>

                {/* Basic Info */}
                <div className="md:col-span-8 space-y-4">
                    <div>
                        <label className={labelClass}>Nome Comercial</label>
                        <input 
                        required
                        type="text" 
                        className={inputClass}
                        value={localConfig.name || ''}
                        onChange={e => setLocalConfig({...localConfig, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Descrição do Negócio</label>
                        <textarea 
                        rows={3}
                        className={inputClass}
                        value={localConfig.description || ''}
                        onChange={e => setLocalConfig({...localConfig, description: e.target.value})}
                        placeholder="Descreva sua pousada..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>WhatsApp / Telefone</label>
                            <input 
                            type="text" 
                            className={inputClass}
                            value={localConfig.phone || ''}
                            onChange={e => setLocalConfig({...localConfig, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>E-mail Comercial</label>
                            <input 
                            type="email" 
                            className={inputClass}
                            value={localConfig.email || ''}
                            onChange={e => setLocalConfig({...localConfig, email: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                </div>

                {/* SECTION 2: MEDIA & GALLERY */}
                <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <ImageIcon className="text-nature-600 dark:text-nature-400" size={20} />
                    Mídia e Divulgação
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                        {/* Photo Gallery */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className={labelClass}>Galeria de Fotos do Negócio</label>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                                    {(localConfig.pdfImages || []).length} / 10 Selecionadas para PDF
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                Clique nas imagens para selecioná-las para o Orçamento em PDF Completo. 
                                A <strong>1ª</strong> será a Capa. A <strong>2ª e 3ª</strong> ficarão na introdução. As demais (até 7) irão para uma página de <strong>Galeria</strong>.
                            </p>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                    {localConfig.galleryImages && localConfig.galleryImages.map((img, idx) => {
                                        const isPdfSelected = (localConfig.pdfImages || []).includes(img);
                                        const pdfIndex = (localConfig.pdfImages || []).indexOf(img);

                                        return (
                                            <div 
                                                key={idx} 
                                                className={`relative group aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${isPdfSelected ? 'border-blue-500 shadow-md transform scale-105 z-10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}
                                                onClick={() => togglePdfImage(img)}
                                            >
                                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                                
                                                {/* Remove Button */}
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                                    title="Excluir imagem"
                                                >
                                                    <Trash2 size={12} />
                                                </button>

                                                {/* Selection Indicator */}
                                                {isPdfSelected && (
                                                    <div className="absolute top-1 left-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-white z-10">
                                                        {pdfIndex + 1}
                                                    </div>
                                                )}
                                                {isPdfSelected && pdfIndex === 0 && (
                                                    <div className="absolute bottom-1 left-1 right-1 bg-blue-600/90 text-white text-[10px] font-bold uppercase text-center py-0.5 rounded shadow-sm">
                                                        Capa
                                                    </div>
                                                )}
                                                {isPdfSelected && pdfIndex >= 1 && pdfIndex <= 2 && (
                                                    <div className="absolute bottom-1 left-1 right-1 bg-nature-600/90 text-white text-[10px] font-bold uppercase text-center py-0.5 rounded shadow-sm">
                                                        Intro
                                                    </div>
                                                )}
                                                {isPdfSelected && pdfIndex >= 3 && (
                                                    <div className="absolute bottom-1 left-1 right-1 bg-orange-500/90 text-white text-[10px] font-bold uppercase text-center py-0.5 rounded shadow-sm">
                                                        Galeria
                                                    </div>
                                                )}
                                                {!isPdfSelected && (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                                        <div className="bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                            Selecionar
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <label className="cursor-pointer aspect-square flex flex-col items-center justify-center border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-nature-600 dark:hover:text-nature-400 hover:border-nature-300 transition-all">
                                        <Plus size={24} className="mb-1"/>
                                        <span className="text-xs font-bold">Adicionar</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400">Arraste fotos ou clique para adicionar. Formatos: JPG, PNG.</p>
                            </div>
                        </div>

                        {/* Promotional Video */}
                        <div>
                            <label className={labelClass}>Vídeo Institucional</label>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col items-center justify-center min-h-[160px]">
                                        {localConfig.promotionalVideo ? (
                                            <video src={localConfig.promotionalVideo} controls className="w-full max-h-[200px] rounded-lg" />
                                        ) : (
                                            <div className="text-center text-gray-400 dark:text-gray-500">
                                                <Video size={32} className="mx-auto mb-2 opacity-50"/>
                                                <p className="text-sm">Nenhum vídeo carregado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Carregue um vídeo curto apresentando a estrutura da pousada e barcos.</p>
                                    <label className="cursor-pointer bg-nature-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-nature-700 flex items-center justify-center gap-2 shadow-sm w-fit">
                                        <Upload size={16} />
                                        Carregar Vídeo (Upload)
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                                    </label>
                                    <p className="text-xs text-gray-400 mt-2">Máx recomendado: 10MB (MP4/WebM)</p>
                                </div>
                            </div>
                        </div>
                </div>
                </div>

                {/* SECTION 3: LOCATION & FISHING DETAILS */}
                <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <MapPin className="text-nature-600 dark:text-nature-400" size={20} />
                    Localização e Pesca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Endereço da Sede</label>
                        <input 
                            type="text" 
                            className={inputClass}
                            value={localConfig.address || ''}
                            onChange={e => setLocalConfig({...localConfig, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Aeroporto Mais Próximo</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Aeroporto de Cuiabá (CGB)"
                            className={inputClass}
                            value={localConfig.nearestAirport || ''}
                            onChange={e => setLocalConfig({...localConfig, nearestAirport: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Distância do Aeroporto</label>
                        <input 
                            type="text" 
                            placeholder="Ex: 120 km (2h de carro)"
                            className={inputClass}
                            value={localConfig.airportDistance || ''}
                            onChange={e => setLocalConfig({...localConfig, airportDistance: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Principal Rio / Lago</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Rio Araguaia"
                            className={inputClass}
                            value={localConfig.mainRiver || ''}
                            onChange={e => setLocalConfig({...localConfig, mainRiver: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Principais Peixes</label>
                        <input 
                            type="text" 
                            placeholder="Ex: Tucunaré, Dourado, Pirarara"
                            className={inputClass}
                            value={localConfig.mainFishes || ''}
                            onChange={e => setLocalConfig({...localConfig, mainFishes: e.target.value})}
                        />
                    </div>
                </div>
                </div>

                {/* SECTION 4: SERVICES */}
                <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <Briefcase className="text-nature-600 dark:text-nature-400" size={20} />
                    Serviços Oferecidos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {SERVICE_OPTIONS.map(service => (
                        <label key={service} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            (localConfig.services || []).includes(service) 
                            ? 'bg-nature-50 dark:bg-nature-900/30 border-nature-500 text-nature-900 dark:text-nature-300 shadow-sm' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}>
                            <input 
                            type="checkbox" 
                            className="h-5 w-5 text-nature-600 rounded focus:ring-nature-500"
                            checked={(localConfig.services || []).includes(service)}
                            onChange={() => toggleService(service)}
                            />
                            <span className="text-sm font-medium">{service}</span>
                        </label>
                    ))}
                </div>
                </div>

                {/* SECTION 5: POLICIES */}
                <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <Fish className="text-nature-600 dark:text-nature-400" size={20} />
                    Políticas e Termos
                </h3>
                <div>
                    <label className={labelClass}>Políticas de Hospedagem (Exibido no rodapé dos orçamentos)</label>
                    <textarea 
                        rows={4}
                        className={inputClass}
                        value={localConfig.policy || ''}
                        onChange={e => setLocalConfig({...localConfig, policy: e.target.value})}
                    />
                </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 -mx-8 -mb-8 p-4 rounded-b-xl">
                {saved && (
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold animate-pulse">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        Configurações salvas com sucesso!
                    </span>
                )}
                <button 
                    type="submit" 
                    className="ml-auto bg-nature-600 hover:bg-nature-700 text-white font-bold py-3 px-8 rounded-lg transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-nature-200 dark:shadow-none"
                >
                    <Save size={20} />
                    Salvar Alterações
                </button>
                </div>
            </form>
        </div>
      )}

      {/* --- TAB: EQUIPE --- */}
      {activeTab === 'equipe' && (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Users size={20} className="text-nature-600"/> Gestão de Acesso
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Adicione até 5 novos membros para gerenciar o negócio.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg text-center">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">Utilização</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.max(0, usageCount - 1)} / 5 <span className="text-sm text-gray-400 font-normal">Extras</span></p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {teamMembers.map(member => (
                        <div key={member.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center text-nature-700 dark:text-nature-400 font-bold">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{member.name} {member.id === user?.id && <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded ml-2">Você</span>}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold uppercase bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full">
                                    {member.role === 'business' ? 'Administrador' : 'Colaborador'}
                                </span>
                                {member.id !== user?.id && (
                                    <button 
                                        onClick={() => removeTeamMember(member.id)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Remover acesso"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {usageCount < usageLimit && (
                    <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
                        {!showAddMember ? (
                            <button 
                                onClick={() => setShowAddMember(true)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 font-bold hover:border-nature-500 hover:text-nature-600 dark:hover:border-nature-400 dark:hover:text-nature-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <UserPlus size={20} />
                                Adicionar Novo Membro
                            </button>
                        ) : (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-800 dark:text-white">Novo Usuário</h4>
                                    <button onClick={closeInviteModal}><X className="text-gray-400 hover:text-gray-600" size={20}/></button>
                                </div>
                                <form onSubmit={handleAddMember} className="space-y-4">
                                    {!inviteLink ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Nome Completo</label>
                                                    <input 
                                                        required
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        value={newMember.name}
                                                        onChange={e => setNewMember({...newMember, name: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 block">E-mail de Acesso</label>
                                                    <input 
                                                        required
                                                        type="email"
                                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                        value={newMember.email}
                                                        onChange={e => setNewMember({...newMember, email: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center border border-blue-100 dark:border-blue-900">
                                                Ao clicar em "Gerar Convite", um link será criado para que você envie ao usuário. Ele definirá a própria senha.
                                            </p>
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={closeInviteModal} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                                                <button type="submit" className="px-6 py-2 bg-nature-600 text-white font-bold rounded-lg hover:bg-nature-700">Gerar Convite</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center space-y-4 py-4">
                                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg flex flex-col items-center">
                                                <CheckCircle className="mb-2" />
                                                <span className="font-bold">Link gerado com sucesso!</span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Envie o link abaixo para <strong>{newMember.name}</strong> para que ele complete o cadastro:
                                            </p>
                                            
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    readOnly
                                                    className="w-full p-3 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 font-mono"
                                                    value={inviteLink}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={copyToClipboard}
                                                    className="p-3 bg-nature-600 text-white rounded-lg hover:bg-nature-700"
                                                    title="Copiar Link"
                                                >
                                                    <Copy size={20} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex justify-center pt-2">
                                                <button type="button" onClick={closeInviteModal} className="text-sm text-gray-500 hover:underline">Fechar e adicionar outro</button>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
