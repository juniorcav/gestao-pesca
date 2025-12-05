
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { Deal, DealStage, BudgetItem, BudgetDetails, ResourceType, Payment, Reservation, AllocatedRoom } from '../types';
import { 
  Plus, MessageCircle, MoreHorizontal, ArrowLeft, ArrowRight, DollarSign, 
  MapPin, Calendar, Users, Fish, Trash2, Save, FileDown, CheckCircle, Ship, BedDouble, User, FileText, ChevronDown, Image as ImageIcon, LayoutTemplate, X, Check
} from 'lucide-react';

declare const html2pdf: any;

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'new', label: 'Novo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { id: 'waiting', label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { id: 'reservation', label: 'Reserva', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { id: 'checkin', label: 'Check-in', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  { id: 'finished', label: 'Finalizado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
];

interface DealCardProps {
  deal: Deal;
  onMove: (id: string, dir: -1 | 1) => void;
  onEdit: (deal: Deal) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onMove, onEdit }) => {
  const openWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    let text = `Olá ${deal.contactName}, tudo bem?`;
    if (deal.budget) {
       text += ` Segue o orçamento para sua pescaria em ${deal.budget.city}: ${deal.budget.fishingDays} dias de pesca para ${deal.budget.peopleCount} pessoas. Valor total: R$ ${deal.value.toLocaleString('pt-BR')}.`;
    }
    window.open(`https://wa.me/${deal.contactPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const paidAmount = deal.payments ? deal.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
  const isPaid = paidAmount >= deal.value && deal.value > 0;

  return (
    <div 
      onClick={() => onEdit(deal)}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group cursor-pointer relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 truncate pr-2">{deal.contactName}</h4>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      {deal.budget && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1">
          {deal.budget.city && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-nature-500" />
              <span>{deal.budget.city}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1" title="Dias de Pesca">
              <Fish size={12} className="text-blue-500" />
              {deal.budget.fishingDays}d
            </span>
            <span className="flex items-center gap-1" title="Pessoas">
              <Users size={12} className="text-orange-500" />
              {deal.budget.peopleCount}p
            </span>
          </div>
          {deal.budget.checkInDate && (
             <div className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" />
                <span>{new Date(deal.budget.checkInDate).toLocaleDateString('pt-BR').slice(0,5)}</span>
             </div>
          )}
        </div>
      )}

      <div className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-between">
        <div className="flex items-center">
            <DollarSign size={14} className="mr-1 text-emerald-600 dark:text-emerald-400" />
            {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
        {(deal.stage === 'reservation' || deal.stage === 'checkin' || deal.stage === 'finished') && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                {isPaid ? 'Pago' : 'Pendente'}
            </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {deal.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
         <button onClick={openWhatsApp} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold flex items-center bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
            <MessageCircle size={14} className="mr-1" />
            WhatsApp
         </button>
         <div className="flex space-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onMove(deal.id, -1); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
              title="Voltar etapa"
            >
              <ArrowLeft size={14} />
            </button>
            <button 
               onClick={(e) => { e.stopPropagation(); onMove(deal.id, 1); }}
               className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
               title="Avançar etapa"
            >
              <ArrowRight size={14} />
            </button>
         </div>
      </div>
    </div>
  );
};

const CRM = () => {
  const { deals, addDeal, updateDeal, updateDealStage, budgetTemplates, config, rooms, boats, guides, addReservation } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showHiddenStages, setShowHiddenStages] = useState(false);
  
  // Budget Form State
  const [dealId, setDealId] = useState<string | null>(null);
  const [dealStage, setDealStage] = useState<DealStage>('new');
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', city: '' });
  const [tripInfo, setTripInfo] = useState({ checkIn: '', checkOut: '', fishingDays: 1, people: 1 });
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notes, setNotes] = useState('');
  
  // Resource Adder State
  const [resourceType, setResourceType] = useState<'budget_template' | 'custom'>('budget_template');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemDesc, setCustomItemDesc] = useState('');
  // Use string | number to handle empty state better during typing
  const [itemPrice, setItemPrice] = useState<string | number>(0);
  const [itemQty, setItemQty] = useState(1);

  // Payment Adder State
  const [newPayAmount, setNewPayAmount] = useState<number>(0);
  const [newPayMethod, setNewPayMethod] = useState('Pix');
  const [newPayNotes, setNewPayNotes] = useState('');

  // Check-in Wizard State
  const [showCheckinWizard, setShowCheckinWizard] = useState(false);
  const [checkinStep, setCheckinStep] = useState(1);
  const [checkinDeal, setCheckinDeal] = useState<Deal | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedBoats, setSelectedBoats] = useState<string[]>([]);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  // Guest mapping: roomId -> Array of Guest Names
  const [roomGuests, setRoomGuests] = useState<Record<string, {name: string, phone: string}[]>>({});

  // PDF Menu State
  const [showPdfMenu, setShowPdfMenu] = useState(false);

  const pdfMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (pdfMenuRef.current && !pdfMenuRef.current.contains(event.target as Node)) {
            setShowPdfMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const resetForm = () => {
    setDealId(null);
    setDealStage('new');
    setClientInfo({ name: '', phone: '', city: '' });
    setTripInfo({ checkIn: '', checkOut: '', fishingDays: 1, people: 1 });
    setBudgetItems([]);
    setPayments([]);
    setNotes('');
    setResourceType('budget_template');
    setCustomItemName('');
    setCustomItemDesc('');
    setItemPrice(0);
    setItemQty(1);
    setNewPayAmount(0);
    setNewPayNotes('');
  };

  const resetCheckinWizard = () => {
    setShowCheckinWizard(false);
    setCheckinStep(1);
    setCheckinDeal(null);
    setSelectedRooms([]);
    setSelectedBoats([]);
    setSelectedGuides([]);
    setRoomGuests({});
  }

  const handleOpenModal = () => {
      resetForm();
      setShowModal(true);
  }

  const handleEditDeal = (deal: Deal) => {
    resetForm();
    setDealId(deal.id);
    setDealStage(deal.stage);
    setClientInfo({
      name: deal.contactName,
      phone: deal.contactPhone,
      city: deal.budget?.city || ''
    });
    setPayments(deal.payments || []);
    setNotes(deal.notes || '');
    
    if (deal.budget) {
      setTripInfo({
        checkIn: deal.budget.checkInDate,
        checkOut: deal.budget.checkOutDate,
        fishingDays: deal.budget.fishingDays,
        people: deal.budget.peopleCount
      });
      setBudgetItems(deal.budget.items);
    }
    
    setShowModal(true);
  };

  // Effect to auto-fill price when resource is selected
  useEffect(() => {
    if (resourceType === 'custom') return;
    
    if (resourceType === 'budget_template') {
        const p = budgetTemplates.find(x => x.id === selectedResourceId);
        if (p) setItemPrice(p.price);
    }
  }, [resourceType, selectedResourceId, budgetTemplates]);

  const addItemToBudget = () => {
    let name = customItemName;
    let description = customItemDesc;
    
    if (resourceType === 'budget_template') {
        const tmpl = budgetTemplates.find(p => p.id === selectedResourceId);
        if (tmpl) {
            name = tmpl.name;
            description = tmpl.description;
        }
    }

    if (!name) {
        alert("Por favor, digite o nome do item ou selecione um modelo do catálogo.");
        return;
    }

    const price = typeof itemPrice === 'string' ? (parseFloat(itemPrice) || 0) : itemPrice;

    const newItem: BudgetItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: resourceType,
        name,
        description,
        quantity: itemQty,
        unitPrice: price,
        totalPrice: price * itemQty
    };

    setBudgetItems([...budgetItems, newItem]);
    
    // Reset item inputs
    setCustomItemName('');
    setCustomItemDesc('');
    setItemQty(1);
    setItemPrice(0);
    setSelectedResourceId('');
  };

  const removeItem = (id: string) => {
    setBudgetItems(budgetItems.filter(i => i.id !== id));
  };

  const handleAddPayment = () => {
    if (newPayAmount <= 0) return;
    
    const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        amount: newPayAmount,
        date: new Date().toISOString(),
        method: newPayMethod,
        notes: newPayNotes
    };
    
    setPayments([...payments, newPayment]);
    setNewPayAmount(0);
    setNewPayNotes('');
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const totalBudget = budgetItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingBalance = totalBudget - totalPaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budget: BudgetDetails = {
        city: clientInfo.city,
        checkInDate: tripInfo.checkIn,
        checkOutDate: tripInfo.checkOut,
        fishingDays: tripInfo.fishingDays,
        peopleCount: tripInfo.people,
        items: budgetItems
    };

    const dealData: Deal = {
        id: dealId || Math.random().toString(36).substr(2, 9),
        contactName: clientInfo.name,
        contactPhone: clientInfo.phone,
        value: totalBudget,
        stage: dealStage, 
        tags: [tripInfo.fishingDays + ' dias', tripInfo.people + ' pessoas'],
        lastInteraction: new Date().toISOString(),
        notes: notes || `Orçamento para ${tripInfo.people} pessoas.`,
        budget: budget,
        payments: payments
    };

    if (dealId) {
      updateDeal(dealData);
      
      // Check if user changed status to checkin manually in modal
      if (dealStage === 'checkin' && deals.find(d => d.id === dealId)?.stage !== 'checkin') {
          // Trigger wizard logic after saving
          setShowModal(false);
          startCheckinWizard(dealData);
          return;
      }

    } else {
      addDeal(dealData);
    }
    setShowModal(false);
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;

    const currentIdx = STAGES.findIndex(s => s.id === deal.stage);
    const newIdx = currentIdx + direction;

    if (newIdx >= 0 && newIdx < STAGES.length) {
      const newStage = STAGES[newIdx].id;
      
      if (newStage === 'checkin' && deal.stage !== 'checkin') {
          startCheckinWizard(deal);
      } else {
          updateDealStage(id, newStage);
      }
    }
  };

  // --- CHECK-IN WIZARD LOGIC ---

  const startCheckinWizard = (deal: Deal) => {
      setCheckinDeal(deal);
      setCheckinStep(1);
      setShowCheckinWizard(true);
      // Pre-fill guests for rooms if empty
      setRoomGuests({});
      setSelectedRooms([]);
      setSelectedBoats([]);
      setSelectedGuides([]);
  };

  const handleCheckinSubmit = () => {
    if (!checkinDeal) return;

    // Create Allocated Rooms Structure
    const allocatedRooms: AllocatedRoom[] = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const guests = roomGuests[roomId] || [];
        return {
            roomId: roomId,
            roomNumber: room?.number || '?',
            guests: guests,
            consumption: []
        };
    });

    const newReservation: Reservation = {
        id: Math.random().toString(36).substr(2, 9),
        mainContactName: checkinDeal.contactName,
        checkInDate: checkinDeal.budget?.checkInDate || new Date().toISOString().split('T')[0],
        checkOutDate: checkinDeal.budget?.checkOutDate || '',
        status: 'checked-in',
        allocatedRooms: allocatedRooms,
        boatIds: selectedBoats,
        guideIds: selectedGuides,
        totalPackageValue: checkinDeal.value,
        paidAmount: checkinDeal.payments.reduce((acc, p) => acc + p.amount, 0),
        payments: checkinDeal.payments || [],
        notes: checkinDeal.notes
    };

    addReservation(newReservation);
    updateDealStage(checkinDeal.id, 'checkin');
    resetCheckinWizard();
  };

  // --- PDF LOGIC ---

  const downloadPDF = (htmlContent: string, filename: string) => {
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      
      const opt = {
        margin: 0, 
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        // IMPORTANT: CSS manually handles page height to avoid blank pages
        pagebreak: { mode: ['css', 'legacy'] }
      };

      html2pdf().from(element).set(opt).save();
  };

  const handleGenerateBudgetPDF = (type: 'simple' | 'complete') => {
    // Determine images to use for complete PDF
    // Prioritize config.pdfImages (max 10 selected in Settings), fallback to galleryImages
    let selectedImages = config.pdfImages || [];
    if (selectedImages.length === 0 && config.galleryImages) {
        selectedImages = config.galleryImages.slice(0, 10);
    }
    
    const htmlContent = generatePDFHtml('Proposta Comercial', false, type, selectedImages);
    downloadPDF(htmlContent, `Orcamento_${clientInfo.name.replace(/\s+/g, '_')}.pdf`);
    
    setShowPdfMenu(false);
  };

  const handleGenerateBookingPDF = () => {
    const htmlContent = generatePDFHtml('Confirmação de Reserva', true, 'simple');
    downloadPDF(htmlContent, `Reserva_${clientInfo.name.replace(/\s+/g, '_')}.pdf`);
  };

  const generatePDFHtml = (title: string, isBooking: boolean, type: 'simple' | 'complete' = 'simple', customImages?: string[]) => {
    // NOTE: PDFs are generated with white background always for printing purposes
    const today = new Date().toLocaleDateString('pt-BR');
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15);
    const validUntilStr = validUntil.toLocaleDateString('pt-BR');
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

    // Logo Logic
    const logoHtml = config.logoUrl 
        ? `<img src="${config.logoUrl}" style="height: 60px; width: auto; object-fit: contain;" alt="Logo"/>`
        : `<div class="brand-logo"><span style="font-size: 24px;">⚓</span></div>`;

    // --- Complete PDF: Landing Page Style Content ---
    let editorialPagesHtml = '';
    
    if (type === 'complete') {
        const availableImages = (customImages && customImages.length > 0) ? customImages : (config.galleryImages || []);
        
        // Image Distribution Strategy:
        // 1. Cover: Image[0]
        // 2. Intro: Image[1], Image[2]
        // 3. Gallery: Image[3] to Image[9] (Max 7 images)
        
        const coverImage = availableImages.length > 0 
            ? availableImages[0] 
            : 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920';
        
        const introImages = availableImages.slice(1, 3);
        const galleryImages = availableImages.slice(3, 10);

        editorialPagesHtml = `
            <!-- PAGE 1: COVER (HERO) -->
            <div class="page cover-page">
                <div class="hero-bg" style="background-image: url('${coverImage}');">
                    <div class="hero-overlay"></div>
                </div>
                <div class="cover-content">
                    <div class="cover-brand">
                        <div class="cover-logo">
                           ${config.logoUrl ? `<img src="${config.logoUrl}"/>` : `<div style="font-size:40px;color:white;">⚓</div>`}
                        </div>
                        <h1 class="business-name">${config.name}</h1>
                    </div>
                    
                    <div class="cover-titles">
                        <div class="line"></div>
                        <h2 class="proposal-title">Proposta Exclusiva</h2>
                        <h3 class="client-name">Preparado para: ${clientInfo.name}</h3>
                        <p class="cover-date">${today}</p>
                    </div>
                </div>
            </div>

            <!-- PAGE 2: INTRO & DETAILS -->
            <div class="page content-page">
                <div class="page-header">
                    <div class="ph-logo">${logoHtml}</div>
                    <div class="ph-text">${config.name} | Apresentação</div>
                </div>

                <div class="intro-layout">
                    <div class="col-text">
                        <h2 class="section-heading">Experiência Inesquecível</h2>
                        <p class="description-text">
                           ${config.description || 'Descubra o melhor da pesca esportiva conosco. Estrutura completa, conforto e os melhores pontos de pesca da região.'}
                        </p>

                        <div class="info-card">
                            <h4 class="card-title">Estrutura & Serviços</h4>
                            <ul class="service-list">
                                ${(config.services || ['Hospedagem Completa', 'Barcos', 'Guias', 'Gastronomia']).slice(0, 8).map(s => `
                                    <li><span class="check">✔</span> ${s}</li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="info-card location-card">
                            <h4 class="card-title">Localização Privilegiada</h4>
                            <div class="loc-item"><strong>Rio/Lago:</strong> ${config.mainRiver || 'Não informado'}</div>
                            <div class="loc-item"><strong>Espécies:</strong> ${config.mainFishes || 'Variadas'}</div>
                            <div class="loc-item"><strong>Acesso:</strong> ${config.nearestAirport ? `${config.nearestAirport} (${config.airportDistance})` : 'Sob consulta'}</div>
                            <div class="loc-item"><strong>Endereço:</strong> ${config.address}</div>
                        </div>
                        
                        <div class="contact-footer">
                           <div>${config.phone}</div>
                           <div>${config.email}</div>
                        </div>
                    </div>
                    
                    <div class="col-visuals">
                         ${introImages.map(img => `
                            <div class="visual-frame" style="background-image: url('${img}');"></div>
                         `).join('')}
                         ${introImages.length === 0 ? `<div class="visual-placeholder">Sem imagens de introdução</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- PAGE 3: GALLERY (Mosaic) -->
            ${galleryImages.length > 0 ? `
            <div class="page content-page">
                <div class="page-header">
                    <div class="ph-logo">${logoHtml}</div>
                    <div class="ph-text">Galeria de Fotos</div>
                </div>
                <div class="gallery-container">
                    <h2 class="section-heading">Nossa Estrutura</h2>
                    <div class="gallery-grid grid-count-${galleryImages.length}">
                        ${galleryImages.map((img, i) => `
                            <div class="g-item item-${i}" style="background-image: url('${img}');"></div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
        `;
    }

    // --- Budget Page (Standard) ---
    const budgetPageHtml = `
          <div class="page content-page">
              <div class="page-header">
                  <div class="ph-logo">${logoHtml}</div>
                  <div class="ph-text">Orçamento Detalhado</div>
              </div>

              <div class="budget-container">
                  <div class="doc-info">
                      <h1 class="doc-main-title">${title}</h1>
                      <div class="doc-meta-row">
                          <span><strong>Data:</strong> ${today}</span>
                          <span><strong>Validade:</strong> ${validUntilStr}</span>
                          <span class="status-tag ${isBooking ? (remainingBalance <= 0 ? 'paid' : 'pending') : 'proposal'}">
                            ${isBooking ? (remainingBalance <= 0 ? 'Pago' : 'Pendente') : 'Orçamento'}
                          </span>
                      </div>
                  </div>

                  <!-- Trip Highlights -->
                  <div class="trip-highlights">
                      <div class="th-item">
                          <span class="th-label">Check-in</span>
                          <span class="th-val">${fmtDate(tripInfo.checkIn)}</span>
                      </div>
                      <div class="th-item">
                          <span class="th-label">Check-out</span>
                          <span class="th-val">${fmtDate(tripInfo.checkOut)}</span>
                      </div>
                      <div class="th-item">
                          <span class="th-label">Pesca</span>
                          <span class="th-val">${tripInfo.fishingDays} Dias</span>
                      </div>
                      <div class="th-item">
                          <span class="th-label">Grupo</span>
                          <span class="th-val">${tripInfo.people} Pessoas</span>
                      </div>
                  </div>

                  <!-- Client Info -->
                  <div class="info-section">
                      <h3 class="sec-head">Dados do Cliente</h3>
                      <div class="info-grid">
                          <div><strong>Nome:</strong> ${clientInfo.name}</div>
                          <div><strong>Telefone:</strong> ${clientInfo.phone}</div>
                          <div><strong>Cidade:</strong> ${clientInfo.city}</div>
                      </div>
                  </div>

                  ${notes ? `
                  <div class="info-section">
                      <h3 class="sec-head">Observações</h3>
                      <div class="notes-box">${notes}</div>
                  </div>
                  ` : ''}

                  <!-- Items Table -->
                  <div class="table-section">
                      <h3 class="sec-head">Investimento</h3>
                      <table>
                          <thead>
                              <tr>
                                  <th style="width: 50%">Descrição</th>
                                  <th class="text-center">Qtd</th>
                                  <th class="text-right">Unitário</th>
                                  <th class="text-right">Total</th>
                              </tr>
                          </thead>
                          <tbody>
                              ${budgetItems.map(item => `
                                  <tr>
                                      <td>
                                          <div class="item-name">${item.name}</div>
                                          ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                                      </td>
                                      <td class="text-center">${item.quantity}</td>
                                      <td class="text-right">R$ ${fmt(item.unitPrice)}</td>
                                      <td class="text-right font-bold">R$ ${fmt(item.totalPrice)}</td>
                                  </tr>
                              `).join('')}
                          </tbody>
                      </table>
                  </div>

                  <!-- Totals -->
                  <div class="totals-section">
                      <div class="totals-box">
                           <div class="t-row"><span>Subtotal:</span> <span>R$ ${fmt(totalBudget)}</span></div>
                           ${isBooking ? `<div class="t-row pay"><span>Pago:</span> <span>(-) R$ ${fmt(totalPaid)}</span></div>` : ''}
                           <div class="t-row final"><span>${isBooking ? 'Saldo Restante:' : 'Valor Total:'}</span> <span>R$ ${fmt(isBooking ? remainingBalance : totalBudget)}</span></div>
                      </div>
                  </div>

                  <!-- Terms -->
                  <div class="terms-footer">
                      <h4>Política de Cancelamento e Termos</h4>
                      <p>${config.policy || 'Consulte nossas políticas de cancelamento e reagendamento.'}</p>
                  </div>
              </div>
              
              <div class="pdf-footer">Gerado via PescaGestor Pro em ${today}</div>
          </div>
    `;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>${title} - ${clientInfo.name}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@300;400;600&display=swap');
              
              /* BASE & RESET */
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: #e5e5e5; font-family: 'Open Sans', sans-serif; -webkit-print-color-adjust: exact; }
              
              /* PAGE CONTAINER - CRITICAL FOR NO BLANK PAGES */
              .page {
                  width: 210mm;
                  height: 296mm; /* 297mm - 1mm tolerance */
                  margin: 0 auto;
                  background: white;
                  position: relative;
                  overflow: hidden; /* Prevents spillover */
                  box-sizing: border-box;
                  page-break-after: always;
              }
              .page:last-child { page-break-after: avoid; }

              /* TYPOGRAPHY COLORS */
              .text-primary { color: #16a34a; }
              .bg-primary { background-color: #16a34a; }

              /* --- COVER PAGE STYLES --- */
              .cover-page { position: relative; padding: 0; }
              .hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; background-size: cover; background-position: center; }
              .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%); }
              
              .cover-content { 
                  position: relative; z-index: 1; height: 100%; 
                  display: flex; flex-direction: column; justify-content: space-between; 
                  padding: 15mm; color: white;
              }
              .cover-brand { display: flex; align-items: center; gap: 15px; margin-top: 10mm; }
              .cover-logo img { height: 60px; width: auto; background: white; padding: 5px; border-radius: 8px; }
              .business-name { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
              
              .cover-titles { margin-bottom: 20mm; }
              .line { width: 60px; height: 6px; background: #22c55e; margin-bottom: 20px; }
              .proposal-title { font-family: 'Montserrat', sans-serif; font-size: 52px; font-weight: 800; text-transform: uppercase; line-height: 1; margin: 0 0 10px 0; }
              .client-name { font-size: 20px; font-weight: 300; margin: 0; opacity: 0.9; }
              .cover-date { font-size: 14px; margin-top: 30px; opacity: 0.7; border-top: 1px solid rgba(255,255,255,0.3); display: inline-block; padding-top: 10px; }

              /* --- CONTENT PAGE STYLES --- */
              .content-page { padding: 10mm 15mm; }
              .page-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 25px; height: 20mm; }
              .ph-logo img { height: 40px; }
              .ph-text { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; color: #166534; text-transform: uppercase; }

              /* INTRO LAYOUT */
              .intro-layout { display: flex; gap: 30px; height: 230mm; } /* Fixed height to fill page */
              .col-text { flex: 1.2; display: flex; flex-direction: column; }
              .col-visuals { flex: 0.8; display: flex; flex-direction: column; gap: 20px; }
              
              .section-heading { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #16a34a; margin: 0 0 15px 0; }
              .description-text { font-size: 13px; line-height: 1.6; color: #4b5563; text-align: justify; margin-bottom: 25px; }
              
              .info-card { background: #f9fafb; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
              .card-title { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 10px 0; text-transform: uppercase; }
              .service-list { list-style: none; padding: 0; margin: 0; font-size: 12px; display: grid; grid-template-columns: 1fr; gap: 6px; }
              .check { color: #16a34a; font-weight: bold; margin-right: 5px; }
              
              .location-card .loc-item { font-size: 12px; margin-bottom: 4px; color: #374151; }
              
              .contact-footer { margin-top: auto; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }

              .visual-frame { flex: 1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; background-size: cover; background-position: center; }
              .visual-placeholder { background: #f3f4f6; flex: 1; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 10px; }

              /* --- GALLERY MOSAIC (SMART GRID) --- */
              .gallery-container { height: 240mm; display: flex; flex-direction: column; }
              .gallery-grid { display: grid; gap: 10px; flex: 1; }
              .g-item { position: relative; overflow: hidden; border-radius: 4px; background: #eee; background-size: cover; background-position: center; background-repeat: no-repeat; }
              
              /* Mosaic Variations */
              .grid-count-1 { grid-template-columns: 1fr; }
              .grid-count-2 { grid-template-columns: 1fr 1fr; }
              .grid-count-3 { grid-template-columns: 1fr 1fr; grid-template-rows: 2fr 1fr; }
              .grid-count-3 .item-0 { grid-column: span 2; }
              .grid-count-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
              .grid-count-5 { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); }
              .grid-count-5 .item-0 { grid-column: span 2; grid-row: span 2; }
              .grid-count-6 { grid-template-columns: repeat(3, 1fr); grid-template-rows: 2fr 1fr; }
              .grid-count-6 .item-0 { grid-column: span 2; }
              .grid-count-6 .item-1 { grid-column: span 1; }
              .grid-count-7 { grid-template-columns: repeat(3, 1fr); grid-template-rows: 2fr 1fr 1fr; }
              .grid-count-7 .item-0 { grid-column: span 2; grid-row: span 2; }

              /* --- BUDGET PAGE STYLES --- */
              .budget-container { height: 240mm; display: flex; flex-direction: column; }
              .doc-main-title { font-family: 'Montserrat', sans-serif; font-size: 22px; color: #16a34a; text-transform: uppercase; margin: 0 0 10px 0; }
              .doc-meta-row { display: flex; gap: 20px; font-size: 12px; color: #4b5563; margin-bottom: 20px; align-items: center; }
              .status-tag { padding: 4px 10px; border-radius: 4px; color: white; font-weight: bold; font-size: 10px; text-transform: uppercase; }
              .status-tag.proposal { background: #0ea5e9; }
              .status-tag.paid { background: #16a34a; }
              .status-tag.pending { background: #dc2626; }

              .trip-highlights { display: flex; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px 0; margin-bottom: 20px; }
              .th-item { flex: 1; text-align: center; border-right: 1px solid #bbf7d0; }
              .th-item:last-child { border-right: none; }
              .th-label { display: block; font-size: 10px; text-transform: uppercase; color: #16a34a; font-weight: 700; margin-bottom: 2px; }
              .th-val { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 600; color: #111827; }

              .info-section { margin-bottom: 20px; }
              .sec-head { font-family: 'Montserrat', sans-serif; font-size: 12px; color: #111827; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin: 0 0 10px 0; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; font-size: 12px; gap: 10px; }
              .notes-box { font-size: 12px; font-style: italic; color: #6b7280; background: #fffbeb; padding: 10px; border-radius: 4px; border: 1px solid #fcd34d; }

              table { width: 100%; border-collapse: collapse; font-size: 12px; }
              th { background: #16a34a; color: white; padding: 8px 10px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10px; }
              td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #374151; }
              tr:nth-child(even) { background: #f9fafb; }
              .item-name { font-weight: 600; }
              .item-desc { font-size: 10px; color: #9ca3af; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }

              .totals-section { margin-top: auto; display: flex; justify-content: flex-end; padding-top: 10px; }
              .totals-box { width: 45%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; }
              .t-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }
              .t-row.final { border-top: 2px solid #16a34a; padding-top: 5px; margin-top: 5px; font-size: 14px; font-weight: 700; color: #166534; }
              .t-row.pay { color: #16a34a; }

              .terms-footer { margin-top: 20px; font-size: 9px; color: #9ca3af; text-align: justify; line-height: 1.4; border-top: 1px solid #e5e7eb; padding-top: 10px; }
              .terms-footer h4 { margin: 0 0 2px 0; color: #6b7280; text-transform: uppercase; }

              .pdf-footer { position: absolute; bottom: 5mm; left: 0; right: 0; text-align: center; font-size: 8px; color: #d1d5db; }

          </style>
      </head>
      <body>
          ${editorialPagesHtml}
          ${budgetPageHtml}
      </body>
      </html>
    `;
  }

  const visibleStages = STAGES.filter(stage => 
     showHiddenStages ? true : (stage.id !== 'finished' && stage.id !== 'lost')
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">CRM & Orçamentos</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie negociações e crie orçamentos detalhados.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={showHiddenStages}
                onChange={(e) => setShowHiddenStages(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-nature-600 focus:ring-nature-500 h-4 w-4 bg-gray-100 dark:bg-gray-700"
              />
              Mostrar Finalizados/Perdidos
            </label>

            <button 
              onClick={handleOpenModal}
              className="bg-nature-600 hover:bg-nature-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-transform hover:scale-105"
            >
              <Plus size={20} />
              Novo Orçamento
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-[1500px]">
          {visibleStages.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            return (
              <div key={stage.id} className="flex-1 min-w-[240px] flex flex-col bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 transition-colors">
                <div className={`flex justify-between items-center mb-3 px-3 py-2 rounded-lg ${stage.color} font-bold shadow-sm`}>
                  <h3 className="text-sm uppercase tracking-wider">{stage.label}</h3>
                  <span className="text-xs bg-white dark:bg-black bg-opacity-60 dark:bg-opacity-30 px-2 py-0.5 rounded-full text-gray-800 dark:text-gray-200">
                    {stageDeals.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 hide-scroll">
                  {stageDeals.map(deal => (
                    <DealCard 
                      key={deal.id} 
                      deal={deal} 
                      onMove={handleMove}
                      onEdit={handleEditDeal}
                    />
                  ))}
                </div>
                
                <div className="pt-3 text-center border-t border-gray-200 dark:border-gray-700 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Total: {stageDeals.reduce((a, b) => a + b.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Budget Generator */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-nature-50 dark:bg-gray-800 rounded-t-xl">
               <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{dealId ? 'Editar Detalhes' : 'Novo Atendimento'}</h3>
                    <p className="text-sm text-nature-600 dark:text-nature-400">
                      {dealId ? 'Edite orçamento, status e financeiro' : 'Crie uma nova proposta'}
                    </p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Trash2 size={24} className="rotate-45" /> 
               </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Deal Status Selector */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between border border-gray-200 dark:border-gray-700">
                 <div className="flex flex-col">
                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Fase da Negociação</label>
                   <p className="text-sm text-gray-400 dark:text-gray-500">Atualize o status para liberar recursos (Ex: Reserva)</p>
                 </div>
                 <select 
                    className="input-field max-w-[250px] font-bold text-nature-800 dark:text-nature-200"
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value as DealStage)}
                 >
                    {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                 </select>
              </div>

              {/* Section 1: Client Info */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 pb-2">1. Dados do Cliente</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                       <label className="label">Nome Completo</label>
                       <input 
                         required
                         className="input-field"
                         value={clientInfo.name}
                         onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                         placeholder="Ex: João da Silva"
                       />
                    </div>
                    <div>
                       <label className="label">WhatsApp</label>
                       <input 
                         required
                         className="input-field"
                         value={clientInfo.phone}
                         onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                         placeholder="5511999999999"
                       />
                    </div>
                    <div>
                       <label className="label">Cidade/Estado</label>
                       <input 
                         className="input-field"
                         value={clientInfo.city}
                         onChange={e => setClientInfo({...clientInfo, city: e.target.value})}
                         placeholder="Ex: São Paulo - SP"
                       />
                    </div>
                 </div>
              </div>

              {/* Section 2: Trip Details */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 pb-2">2. Detalhes da Pescaria</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                       <label className="label">Check-in</label>
                       <input 
                         type="date"
                         className="input-field"
                         value={tripInfo.checkIn}
                         onChange={e => setTripInfo({...tripInfo, checkIn: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="label">Check-out</label>
                       <input 
                         type="date"
                         className="input-field"
                         value={tripInfo.checkOut}
                         onChange={e => setTripInfo({...tripInfo, checkOut: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="label">Dias de Pesca</label>
                       <input 
                         type="number"
                         min="1"
                         className="input-field"
                         value={tripInfo.fishingDays}
                         onChange={e => setTripInfo({...tripInfo, fishingDays: parseInt(e.target.value) || 0})}
                       />
                    </div>
                    <div>
                       <label className="label">Qtd. Pessoas</label>
                       <input 
                         type="number"
                         min="1"
                         className="input-field"
                         value={tripInfo.people}
                         onChange={e => setTripInfo({...tripInfo, people: parseInt(e.target.value) || 0})}
                       />
                    </div>
                 </div>
                 
                 {/* NOTES FIELD */}
                 <div>
                    <label className="label flex items-center gap-1"><FileText size={12}/> Observações Gerais do Orçamento</label>
                    <textarea 
                        className="input-field"
                        rows={2}
                        placeholder="Detalhes adicionais, restrições alimentares, solicitações especiais..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />
                 </div>
              </div>

              {/* Section 3: Resources & Values */}
              <div className="space-y-4">
                 <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b dark:border-gray-700 pb-2">3. Composição do Orçamento</h4>
                 
                 {/* Item Adder */}
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                       <label className="label">Origem do Item</label>
                       <select 
                          className="input-field"
                          value={resourceType}
                          onChange={(e) => {
                             setResourceType(e.target.value as any);
                             setSelectedResourceId('');
                             setCustomItemName('');
                             setCustomItemDesc('');
                             setItemPrice(0);
                          }}
                       >
                          <option value="budget_template">Item do Catálogo</option>
                          <option value="custom">Item Personalizado</option>
                       </select>
                    </div>

                    <div className="md:col-span-4">
                       <label className="label">Item / Nome</label>
                       {resourceType === 'custom' ? (
                          <div className="space-y-2">
                            <input 
                               className="input-field"
                               placeholder="Nome do Item (Ex: Translado)"
                               value={customItemName}
                               onChange={e => setCustomItemName(e.target.value)}
                            />
                            <input 
                               className="input-field text-xs"
                               placeholder="Descrição detalhada (Opcional)"
                               value={customItemDesc}
                               onChange={e => setCustomItemDesc(e.target.value)}
                            />
                          </div>
                       ) : (
                          <select 
                             className="input-field"
                             value={selectedResourceId}
                             onChange={e => setSelectedResourceId(e.target.value)}
                          >
                             <option value="">Selecione...</option>
                             {budgetTemplates.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                       )}
                    </div>

                    <div className="md:col-span-2">
                       <label className="label">Qtd.</label>
                       <input 
                          type="number"
                          min="1"
                          className="input-field"
                          value={itemQty}
                          onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                       />
                    </div>
                    
                    <div className="md:col-span-2">
                       <label className="label">Valor Unit. (R$)</label>
                       <input 
                          type="number"
                          step="0.01"
                          className="input-field"
                          value={itemPrice}
                          onChange={e => setItemPrice(e.target.value)}
                          onBlur={e => setItemPrice(parseFloat(e.target.value) || 0)}
                       />
                    </div>

                    <div className="md:col-span-1">
                       <button 
                          type="button"
                          onClick={addItemToBudget}
                          className="w-full bg-nature-600 hover:bg-nature-700 text-white p-2 rounded-lg flex justify-center shadow-sm"
                       >
                          <Plus size={20} />
                       </button>
                    </div>
                 </div>

                 {/* Items List */}
                 <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                       <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                             <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qtd</th>
                             <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit.</th>
                             <th className="px-4 py-2 text-right text-xs font-medium text-gray-900 dark:text-white uppercase">Total</th>
                             <th className="px-4 py-2"></th>
                          </tr>
                       </thead>
                       <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                          {budgetItems.map(item => (
                             <tr key={item.id}>
                                <td className="px-4 py-2">
                                   <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                   {item.description && <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white text-right">R$ {item.totalPrice.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">
                                   <button type="button" onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                                      <Trash2 size={16} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                       <tfoot className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                             <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">Total do Orçamento:</td>
                             <td className="px-4 py-3 text-right text-lg font-bold text-nature-700 dark:text-nature-400">R$ {totalBudget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                             <td></td>
                          </tr>
                       </tfoot>
                    </table>
                 </div>
              </div>

              {/* SECTION 4: FINANCIAL & RESERVATION */}
              {(dealStage === 'reservation' || dealStage === 'checkin' || dealStage === 'finished') && (
                <div className="space-y-4 border-t-2 border-indigo-100 dark:border-indigo-900 pt-6">
                    <h4 className="text-lg font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={20}/> 
                        4. Confirmação de Reserva & Financeiro
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Financial Summary */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
                            <h5 className="font-bold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Resumo de Valores</h5>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Valor Total:</span>
                                <span className="font-bold text-lg text-gray-900 dark:text-white">R$ {totalBudget.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Total Pago:</span>
                                <span className="font-bold text-lg text-green-600 dark:text-green-400">R$ {totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pt-2 border-t dark:border-gray-700">
                                <span className="text-gray-500 dark:text-gray-400">Restante:</span>
                                <span className={`font-bold text-lg ${remainingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                    R$ {remainingBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>

                        {/* Add Payment Form */}
                        <div className="md:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                             <h5 className="font-bold text-indigo-900 dark:text-indigo-300 mb-3 text-sm uppercase">Adicionar Pagamento / Sinal</h5>
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                <div>
                                    <label className="label">Valor (R$)</label>
                                    <input 
                                        type="number"
                                        className="input-field"
                                        value={newPayAmount}
                                        onChange={e => setNewPayAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Forma Pagto.</label>
                                    <select 
                                        className="input-field"
                                        value={newPayMethod}
                                        onChange={e => setNewPayMethod(e.target.value)}
                                    >
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Transferência">Transferência</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                    <div className="flex-1">
                                        <label className="label">Obs.</label>
                                        <input 
                                            className="input-field"
                                            placeholder="Ex: Sinal 30%"
                                            value={newPayNotes}
                                            onChange={e => setNewPayNotes(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleAddPayment}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg h-[42px] w-[42px] flex items-center justify-center shadow-sm"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                             </div>

                             {/* Payments List */}
                             <div className="mt-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-3 py-2 text-left dark:text-gray-300">Data</th>
                                            <th className="px-3 py-2 text-left dark:text-gray-300">Método</th>
                                            <th className="px-3 py-2 text-left dark:text-gray-300">Obs</th>
                                            <th className="px-3 py-2 text-right dark:text-gray-300">Valor</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700">
                                                <td className="px-3 py-2 dark:text-gray-300">{new Date(p.date).toLocaleDateString('pt-BR')}</td>
                                                <td className="px-3 py-2 dark:text-gray-300">{p.method}</td>
                                                <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{p.notes}</td>
                                                <td className="px-3 py-2 text-right font-medium dark:text-gray-200">R$ {p.amount.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => removePayment(p.id)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                </div>
              )}

            </form>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
               {(dealStage === 'reservation' || dealStage === 'checkin' || dealStage === 'finished') ? (
                  <button 
                    type="button" 
                    onClick={handleGenerateBookingPDF} 
                    className="px-6 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-2 mr-auto"
                  >
                    <CheckCircle size={18} />
                    Confirmar e Baixar PDF
                  </button>
               ) : (
                  <div className="relative mr-auto" ref={pdfMenuRef}>
                      <button 
                        type="button" 
                        onClick={() => setShowPdfMenu(!showPdfMenu)}
                        className="px-6 py-2 text-sm font-medium text-nature-700 dark:text-nature-300 bg-nature-50 dark:bg-nature-900/30 border border-nature-200 dark:border-nature-800 rounded-lg hover:bg-nature-100 dark:hover:bg-nature-900/50 flex items-center gap-2"
                      >
                        <FileDown size={18} />
                        Gerar Proposta PDF
                        <ChevronDown size={14} />
                      </button>

                      {showPdfMenu && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                              <button 
                                onClick={() => handleGenerateBudgetPDF('simple')}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                              >
                                  <FileText size={16} className="text-nature-600" />
                                  <span>Simples (Apenas Valores)</span>
                              </button>
                              <button 
                                onClick={() => handleGenerateBudgetPDF('complete')}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                              >
                                  <ImageIcon size={16} className="text-blue-600" />
                                  <span>Completo (Tipo Landing Page)</span>
                              </button>
                          </div>
                      )}
                  </div>
               )}

               <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm"
               >
                  Cancelar
               </button>
               <button 
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 text-sm font-bold text-white bg-nature-600 rounded-lg hover:bg-nature-700 flex items-center gap-2 shadow-sm"
               >
                  <Save size={18} />
                  Salvar
               </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECK-IN WIZARD MODAL */}
      {showCheckinWizard && checkinDeal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors border border-gray-200 dark:border-gray-700">
                {/* Wizard Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-emerald-600 rounded-t-xl text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Realizar Check-in</h3>
                        <p className="text-emerald-100 text-sm">Reserva de {checkinDeal.contactName}</p>
                    </div>
                    <div className="text-right text-sm opacity-80">
                        Passo {checkinStep} de 3
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {checkinStep === 1 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">1. Seleção de Recursos</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Quais recursos serão utilizados nesta estadia?</p>
                            
                            {/* Rooms Selection */}
                            <div>
                                <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><BedDouble size={18}/> Quartos Disponíveis</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {rooms.filter(r => r.status === 'available').map(room => (
                                        <label key={room.id} className={`border p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedRooms.includes(room.id) ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                                                checked={selectedRooms.includes(room.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedRooms([...selectedRooms, room.id]);
                                                    else setSelectedRooms(selectedRooms.filter(id => id !== room.id));
                                                }}
                                            />
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white">#{room.number}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{room.name}</div>
                                            </div>
                                        </label>
                                    ))}
                                    {rooms.filter(r => r.status === 'available').length === 0 && <p className="text-sm text-red-500">Nenhum quarto disponível.</p>}
                                </div>
                            </div>

                            {/* Boats Selection */}
                            <div>
                                <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Ship size={18}/> Barcos Disponíveis</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {boats.filter(b => b.status === 'available').map(boat => (
                                        <label key={boat.id} className={`border p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedBoats.includes(boat.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                checked={selectedBoats.includes(boat.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedBoats([...selectedBoats, boat.id]);
                                                    else setSelectedBoats(selectedBoats.filter(id => id !== boat.id));
                                                }}
                                            />
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white">{boat.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{boat.type}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Guides Selection */}
                            <div>
                                <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><User size={18}/> Guias Disponíveis</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {guides.filter(g => g.status === 'available').map(guide => (
                                        <label key={guide.id} className={`border p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedGuides.includes(guide.id) ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 ring-1 ring-amber-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                            <input 
                                                type="checkbox" 
                                                className="h-5 w-5 text-amber-600 rounded focus:ring-amber-500"
                                                checked={selectedGuides.includes(guide.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedGuides([...selectedGuides, guide.id]);
                                                    else setSelectedGuides(selectedGuides.filter(id => id !== guide.id));
                                                }}
                                            />
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white">{guide.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{guide.specialty}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {checkinStep === 2 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">2. Registro de Hóspedes</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Identifique os hóspedes em cada quarto selecionado.</p>

                            {selectedRooms.length === 0 ? (
                                <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <Ship size={48} className="mx-auto text-blue-500 mb-2" />
                                    <h5 className="font-bold text-blue-700 dark:text-blue-300">Modo Embarcado (Day Use)</h5>
                                    <p className="text-sm text-blue-600 dark:text-blue-200">
                                        Nenhum quarto selecionado. O registro de consumo e hóspedes será feito diretamente nos barcos.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {selectedRooms.map(roomId => {
                                        const room = rooms.find(r => r.id === roomId);
                                        const guests = roomGuests[roomId] || [];
                                        
                                        const addGuest = () => {
                                            const newGuests = [...guests, { name: '', phone: '' }];
                                            setRoomGuests({ ...roomGuests, [roomId]: newGuests });
                                        };

                                        const updateGuest = (idx: number, field: 'name'|'phone', val: string) => {
                                            const newGuests = [...guests];
                                            newGuests[idx] = { ...newGuests[idx], [field]: val };
                                            setRoomGuests({ ...roomGuests, [roomId]: newGuests });
                                        };

                                        return (
                                            <div key={roomId} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800 shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-bold text-gray-800 dark:text-white">Quarto {room?.number} - {room?.name}</h5>
                                                    <button onClick={addGuest} className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-1 shadow-sm text-gray-700 dark:text-gray-200">
                                                        <Plus size={12}/> Adicionar Hóspede
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {guests.map((g, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <input 
                                                                placeholder="Nome Completo" 
                                                                className="flex-1 input-field"
                                                                value={g.name}
                                                                onChange={e => updateGuest(idx, 'name', e.target.value)}
                                                            />
                                                            <input 
                                                                placeholder="Telefone" 
                                                                className="w-1/3 input-field"
                                                                value={g.phone}
                                                                onChange={e => updateGuest(idx, 'phone', e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                    {guests.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum hóspede registrado neste quarto.</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {checkinStep === 3 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">3. Confirmação</h4>
                            
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center shadow-sm">
                                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Tudo pronto!</h2>
                                <p className="text-emerald-700 dark:text-emerald-300">Confira os dados abaixo antes de confirmar o check-in.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="block text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">Cliente Principal</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{checkinDeal.contactName}</span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="block text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">Período</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {new Date(checkinDeal.budget?.checkInDate || '').toLocaleDateString('pt-BR')} até {new Date(checkinDeal.budget?.checkOutDate || '').toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="block text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">Quartos Ocupados</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">{selectedRooms.length} Quartos</span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                    <span className="block text-gray-500 dark:text-gray-400 font-bold uppercase text-xs">Total Hóspedes</span>
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {Object.values(roomGuests).reduce((acc: number, curr: any) => acc + curr.length, 0)} Pessoas
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wizard Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                    {checkinStep > 1 ? (
                        <button 
                            onClick={() => setCheckinStep(checkinStep - 1)}
                            className="px-6 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700 shadow-sm"
                        >
                            Voltar
                        </button>
                    ) : (
                        <button 
                            onClick={resetCheckinWizard}
                            className="px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                            Cancelar
                        </button>
                    )}

                    {checkinStep < 3 ? (
                         <button 
                            onClick={() => {
                                // Alteração aqui: Permitir avançar se tiver quarto OU barco
                                if (checkinStep === 1 && selectedRooms.length === 0 && selectedBoats.length === 0) {
                                    alert("Selecione pelo menos um quarto OU um barco.");
                                    return;
                                }
                                setCheckinStep(checkinStep + 1);
                            }}
                            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
                         >
                            Próximo <ArrowRight size={16} />
                         </button>
                    ) : (
                        <button 
                            onClick={handleCheckinSubmit}
                            className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
                         >
                            <CheckCircle size={18} /> Confirmar Check-in
                         </button>
                    )}
                </div>
             </div>
          </div>
      )}

      <style>{`
         .label { display: block; font-size: 0.75rem; font-weight: 700; color: #4b5563; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.025em; }
         .dark .label { color: #9ca3af; }
         .input-field { 
            width: 100%; 
            padding: 0.6rem 0.75rem; 
            border: 1px solid #d1d5db; 
            border-radius: 0.5rem; 
            outline: none; 
            color: #1f2937; 
            background-color: #f9fafb; 
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

export default CRM;
