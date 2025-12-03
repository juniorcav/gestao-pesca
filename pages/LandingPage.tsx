
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { MapPin, Phone, Mail, Anchor, Fish, CheckCircle, ArrowRight, Instagram, Facebook, MessageCircle, Star, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const { config, budgetTemplates } = useApp();

  const heroImage = config.galleryImages && config.galleryImages.length > 0 
    ? config.galleryImages[0] 
    : 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920';

  const handleWhatsAppClick = (packageName?: string) => {
    let message = `Olá! Gostaria de mais informações sobre a ${config.name}. Vim através do site.`;
    if (packageName) {
        message = `Olá! Tenho interesse no pacote "${packageName}" que vi no site da ${config.name}.`;
    }
    window.open(`https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="font-sans text-gray-800 bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 text-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
               {config.logoUrl ? (
                   <img src={config.logoUrl} alt="Logo" className="h-12 w-auto object-contain" />
               ) : (
                   <div className="h-10 w-10 bg-nature-600 rounded-lg flex items-center justify-center">
                      <Anchor size={24} />
                   </div>
               )}
               <span className="font-bold text-lg uppercase tracking-wider hidden md:block">{config.name}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
              <a href="#about" className="hover:text-nature-300 transition-colors">A Pousada</a>
              <a href="#fishing" className="hover:text-nature-300 transition-colors">Pesca</a>
              {budgetTemplates.length > 0 && <a href="#packages" className="hover:text-nature-300 transition-colors">Pacotes</a>}
              <a href="#gallery" className="hover:text-nature-300 transition-colors">Galeria</a>
              <a href="#location" className="hover:text-nature-300 transition-colors">Localização</a>
            </div>
            <div className="flex items-center gap-4">
               <Link to="/login" className="text-sm font-medium hover:text-nature-300 flex items-center gap-2">
                  <User size={16} /> Área do Cliente
               </Link>
               <button 
                 onClick={() => handleWhatsAppClick()}
                 className="bg-nature-600 hover:bg-nature-700 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg flex items-center gap-2"
               >
                 <MessageCircle size={16} />
                 <span className="hidden sm:inline">Reservar Agora</span>
                 <span className="sm:hidden">Reservar</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-16 animate-fade-in-up">
          <div className="mb-4 flex justify-center">
             <div className="bg-nature-600/20 backdrop-blur-sm border border-nature-500/30 text-nature-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
                Pesca Esportiva & Ecoturismo
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-serif tracking-tight drop-shadow-lg">
            {config.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {config.description.length > 150 ? config.description.substring(0, 150) + '...' : config.description}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleWhatsAppClick()}
              className="w-full md:w-auto bg-nature-600 hover:bg-nature-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
            >
              Falar com Especialista
              <ArrowRight size={20} />
            </button>
            <a 
               href="#about"
               className="w-full md:w-auto bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center"
            >
               Conhecer Estrutura
            </a>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
           <ArrowRight size={24} className="rotate-90" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-nature-900 text-white py-8 border-b border-nature-800 relative z-20 -mt-2 shadow-2xl">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-nature-800">
             <div className="p-2">
                <p className="text-nature-400 text-xs font-bold uppercase tracking-wider mb-1">Localização</p>
                <p className="font-bold text-lg md:text-xl truncate">{config.mainRiver || 'Rio Principal'}</p>
             </div>
             <div className="p-2">
                <p className="text-nature-400 text-xs font-bold uppercase tracking-wider mb-1">Aeroporto</p>
                <p className="font-bold text-lg md:text-xl truncate">{config.airportDistance || '100km'}</p>
             </div>
             <div className="p-2">
                <p className="text-nature-400 text-xs font-bold uppercase tracking-wider mb-1">Espécies</p>
                <p className="font-bold text-lg md:text-xl truncate">{config.mainFishes ? config.mainFishes.split(',')[0] : 'Várias'}</p>
             </div>
             <div className="p-2">
                <p className="text-nature-400 text-xs font-bold uppercase tracking-wider mb-1">Serviço</p>
                <p className="font-bold text-lg md:text-xl truncate">Premium</p>
             </div>
         </div>
      </div>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
                {config.promotionalVideo ? (
                    <div className="rounded-2xl overflow-hidden shadow-2xl relative group ring-8 ring-white">
                        <video 
                            src={config.promotionalVideo} 
                            className="w-full h-auto object-cover" 
                            controls
                            poster={config.galleryImages?.[0]}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <img src={config.galleryImages?.[1] || heroImage} className="rounded-2xl shadow-lg mt-8 ring-4 ring-white" alt="About 1" />
                        <img src={config.galleryImages?.[2] || heroImage} className="rounded-2xl shadow-lg mb-8 ring-4 ring-white" alt="About 2" />
                    </div>
                )}
                {/* Decoration */}
                <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-nature-200 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h4 className="text-nature-600 font-bold uppercase tracking-wider text-sm mb-2">Sobre a Pousada</h4>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">A Experiência Definitiva de Pesca</h2>
              <div className="prose prose-lg text-gray-600 mb-8 leading-relaxed text-justify">
                 <p>{config.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                 {config.services && config.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                       <CheckCircle className="text-nature-600 flex-shrink-0" size={20} />
                       <span className="font-medium text-gray-700">{service}</span>
                    </div>
                 ))}
              </div>

              <button onClick={() => handleWhatsAppClick()} className="text-nature-700 font-bold border-b-2 border-nature-600 pb-1 hover:text-nature-800 transition-colors inline-flex items-center gap-2 text-lg">
                 Solicitar Orçamento Personalizado <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section (Dynamic from budgetTemplates) */}
      {budgetTemplates.length > 0 && (
          <section id="packages" className="py-20 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                      <span className="text-nature-600 font-bold uppercase tracking-wider text-sm">Tarifário</span>
                      <h2 className="text-3xl md:text-4xl font-bold mt-2 font-serif text-gray-900">Nossos Pacotes em Destaque</h2>
                      <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Escolha a opção ideal para o seu grupo. Personalizamos conforme sua necessidade.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {budgetTemplates.map((template) => (
                          <div key={template.id} className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
                              <div className="bg-nature-900 h-2"></div>
                              <div className="p-8 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-4">
                                      <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                                      <Star className="text-yellow-400 fill-yellow-400" size={20}/>
                                  </div>
                                  <p className="text-gray-500 text-sm mb-6 flex-1">{template.description}</p>
                                  
                                  <div className="mb-6">
                                      <p className="text-xs text-gray-400 uppercase font-bold">A partir de</p>
                                      <div className="flex items-baseline gap-1">
                                          <span className="text-sm text-gray-500">R$</span>
                                          <span className="text-3xl font-bold text-nature-700">{template.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                          <span className="text-xs text-gray-400">/ pessoa</span>
                                      </div>
                                  </div>

                                  <button 
                                      onClick={() => handleWhatsAppClick(template.name)}
                                      className="w-full bg-nature-50 text-nature-700 font-bold py-3 rounded-xl border border-nature-200 hover:bg-nature-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                                  >
                                      <MessageCircle size={18} />
                                      Consultar Disponibilidade
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      )}

      {/* Fishing Info Section */}
      <section id="fishing" className="py-20 bg-nature-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-nature-800/30 skew-x-12 transform translate-x-20"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
               <span className="text-nature-400 font-bold uppercase tracking-wider text-sm">Nossa Região</span>
               <h2 className="text-3xl md:text-4xl font-bold mt-2 font-serif">Onde a Natureza Encontra a Aventura</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="h-14 w-14 bg-nature-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Anchor size={32} className="text-white"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{config.mainRiver || 'Rio da Região'}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                     Navegue pelas águas preservadas. Um ecossistema rico e perfeito para a prática da pesca esportiva.
                  </p>
               </div>

               <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="h-14 w-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Fish size={32} className="text-white"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Principais Espécies</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                     {config.mainFishes || 'Tucunarés, Dourados e Pintados'}. Prepare seu equipamento para grandes troféus e fisgadas inesquecíveis.
                  </p>
               </div>

               <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
                  <div className="h-14 w-14 bg-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <MapPin size={32} className="text-white"/>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Fácil Acesso</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                     Estamos localizados a {config.airportDistance || 'poucas horas'} do {config.nearestAirport || 'Aeroporto'}. Oferecemos translado.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <span className="text-nature-600 font-bold uppercase tracking-wider text-sm">Fotos Reais</span>
               <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mt-2">Nossa Estrutura</h2>
               <p className="text-gray-500 mt-4 max-w-2xl mx-auto">Confira algumas fotos de nossos quartos, barcos e da natureza exuberante que nos cerca.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
               {config.galleryImages && config.galleryImages.map((img, idx) => (
                  <div key={idx} className={`relative group overflow-hidden rounded-xl cursor-pointer shadow-md ${idx === 0 ? 'col-span-2 row-span-2' : ''}`}>
                     <img 
                        src={img} 
                        alt={`Gallery ${idx}`} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                  </div>
               ))}
               {(!config.galleryImages || config.galleryImages.length === 0) && (
                   <div className="col-span-4 py-20 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                       <p className="text-gray-400 italic">Nenhuma imagem na galeria ainda.</p>
                   </div>
               )}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-nature-50 border-t border-nature-100">
         <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-nature-900 mb-6 font-serif">Pronto para sua pescaria dos sonhos?</h2>
            <p className="text-xl text-nature-700 mb-10 max-w-3xl mx-auto">
               Garanta sua reserva com antecedência. Temos pacotes especiais para grupos e famílias.
            </p>
            <button 
               onClick={() => handleWhatsAppClick()}
               className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 mx-auto"
            >
               <MessageCircle size={24} />
               Falar no WhatsApp
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer id="location" className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
               <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-6 text-white">
                     {config.logoUrl ? (
                         <img src={config.logoUrl} className="h-8 w-auto grayscale opacity-80" alt="logo footer"/>
                     ) : (
                         <Anchor className="text-nature-500" size={24}/>
                     )}
                     <span className="font-bold text-xl uppercase tracking-wider">{config.name}</span>
                  </div>
                  <p className="mb-6 max-w-sm leading-relaxed text-gray-500">
                     {config.description ? config.description.substring(0, 120) : 'Descrição do negócio...'}...
                  </p>
                  <div className="flex gap-4">
                     <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-nature-600 hover:text-white transition-colors"><Instagram size={20}/></a>
                     <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"><Facebook size={20}/></a>
                  </div>
               </div>

               <div>
                  <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Contato</h4>
                  <ul className="space-y-4">
                     <li className="flex items-start gap-3">
                        <Phone size={18} className="text-nature-600 mt-1"/>
                        <span>{config.phone || '(00) 0000-0000'}</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <Mail size={18} className="text-nature-600 mt-1"/>
                        <span>{config.email || 'contato@pousada.com'}</span>
                     </li>
                     <li className="flex items-start gap-3">
                        <MapPin size={18} className="text-nature-600 mt-1"/>
                        <span>{config.address || 'Endereço não informado'}</span>
                     </li>
                  </ul>
               </div>

               <div>
                  <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">Links Úteis</h4>
                  <ul className="space-y-2">
                     <li><a href="#about" className="hover:text-white transition-colors">Sobre Nós</a></li>
                     <li><a href="#" className="hover:text-white transition-colors">Termos e Políticas</a></li>
                     <li><Link to="/login" className="hover:text-white transition-colors">Área do Cliente</Link></li>
                  </ul>
               </div>
            </div>

            <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
               <p>© {new Date().getFullYear()} {config.name}. Todos os direitos reservados.</p>
               <p className="opacity-50">Desenvolvido com PescaGestor Pro</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
