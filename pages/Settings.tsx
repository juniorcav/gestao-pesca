import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Upload, Save, MapPin, Fish, Briefcase, Info, Image as ImageIcon, Video, Trash2, Plus, Globe, Copy, ExternalLink, Check } from 'lucide-react';

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
  const { config, updateConfig } = useApp();
  const [localConfig, setLocalConfig] = useState(config);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sincroniza o formulário local quando os dados do banco (contexto) são carregados
  useEffect(() => {
    if (config) {
        setLocalConfig(config);
    }
  }, [config]);

  // Generate the public link based on current location (Robust method)
  const publicLink = `${window.location.href.split('#')[0]}#/landing`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      const newImages = [...(localConfig.galleryImages || [])];
      newImages.splice(index, 1);
      setLocalConfig({...localConfig, galleryImages: newImages});
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

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-6 border-b dark:border-gray-700 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações do Negócio</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Personalize os dados da sua operação (White Label)</p>
        </div>
        <div className="h-10 w-10 bg-nature-100 dark:bg-nature-900 rounded-full flex items-center justify-center text-nature-700 dark:text-nature-400">
           <Info size={24} />
        </div>
      </div>
      
      {/* PUBLIC LINK SECTION */}
      <div className="mb-8 bg-gradient-to-r from-nature-50 to-blue-50 dark:from-nature-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-nature-100 dark:border-nature-800 shadow-sm">
         <div className="flex items-start justify-between mb-4">
             <div>
                 <h3 className="text-lg font-bold text-nature-800 dark:text-nature-300 flex items-center gap-2">
                     <Globe size={20} /> Link de Acesso Público
                 </h3>
                 <p className="text-sm text-nature-600 dark:text-nature-400">Este é o link da sua Landing Page. Compartilhe com seus clientes.</p>
             </div>
             <a 
                href={publicLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm bg-white dark:bg-gray-800 text-nature-700 dark:text-nature-300 px-3 py-1.5 rounded-lg border border-nature-200 dark:border-nature-700 hover:bg-nature-50 dark:hover:bg-gray-700 flex items-center gap-2 font-medium shadow-sm"
             >
                <ExternalLink size={16} /> Abrir Site
             </a>
         </div>
         
         <div className="flex items-center gap-2">
             <div className="flex-1 bg-white dark:bg-gray-900 border border-nature-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300 font-mono overflow-x-auto whitespace-nowrap shadow-inner">
                 {publicLink}
             </div>
             <button 
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-md
                   ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-nature-600 hover:bg-nature-700'}
                `}
             >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar'}
             </button>
         </div>
      </div>
      
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
                    <label className={labelClass}>Galeria de Fotos do Negócio</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/50">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            {localConfig.galleryImages && localConfig.galleryImages.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
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
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 p-4 -mx-8 -mb-8 rounded-b-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
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
  );
};

export default Settings;