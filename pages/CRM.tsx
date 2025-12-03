
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Deal, DealStage, BudgetItem, BudgetDetails, ResourceType, Payment, Reservation, AllocatedRoom } from '../types';
import { 
  Plus, MessageCircle, MoreHorizontal, ArrowLeft, ArrowRight, DollarSign, 
  MapPin, Calendar, Users, Fish, Trash2, Save, FileDown, CheckCircle, Ship, BedDouble, User, FileText
} from 'lucide-react';

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
  const [itemPrice, setItemPrice] = useState(0);
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

    if (!name) return;

    const newItem: BudgetItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: resourceType,
        name,
        description,
        quantity: itemQty,
        unitPrice: itemPrice,
        totalPrice: itemPrice * itemQty
    };

    setBudgetItems([...budgetItems, newItem]);
    
    // Reset item inputs
    setCustomItemName('');
    setCustomItemDesc('');
    setItemQty(1);
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
        dealId: checkinDeal.id,
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

  const handleGenerateBudgetPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = generatePDFHtml('Proposta Comercial', false);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleGenerateBookingPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = generatePDFHtml('Confirmação de Reserva', true);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const generatePDFHtml = (title: string, isBooking: boolean) => {
    // NOTE: PDFs are generated with white background always for printing purposes
    const today = new Date().toLocaleDateString('pt-BR');
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15);
    const validUntilStr = validUntil.toLocaleDateString('pt-BR');
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

    // Logo Logic
    const logoHtml = config.logoUrl 
        ? `<img src="${config.logoUrl}" style="height: 80px; width: auto; object-fit: contain;" alt="Logo"/>`
        : `<div class="brand-logo"><span style="font-size: 30px;">⚓</span></div>`;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>${title} - ${clientInfo.name}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: #e5e7eb; font-family: 'Open Sans', sans-serif; color: #374151; -webkit-print-color-adjust: exact; }
              .page { width: 210mm; min-height: 297mm; padding: 15mm 20mm; margin: 10mm auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative; box-sizing: border-box; }
              @media print { body { background: none; margin: 0; } .page { margin: 0; box-shadow: none; width: auto; height: auto; } }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
              .brand-container { display: flex; align-items: center; gap: 15px; }
              .brand-logo { width: 60px; height: 60px; background: #166534; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 24px; font-weight: bold; }
              .brand-text h1 { font-family: 'Montserrat', sans-serif; font-size: 20px; color: #166534; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
              .brand-text p { font-size: 11px; color: #6b7280; margin: 2px 0 0; line-height: 1.4; }
              .doc-meta { text-align: right; }
              .doc-title { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 700; color: #16a34a; text-transform: uppercase; margin: 0 0 5px 0; }
              .doc-id { font-size: 12px; color: #9ca3af; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
              .bg-paid { background: #dcfce7; color: #166534; }
              .bg-pending { background: #fee2e2; color: #991b1b; }
              .bg-proposal { background: #e0f2fe; color: #075985; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
              .box h3 { font-family: 'Montserrat', sans-serif; font-size: 12px; text-transform: uppercase; color: #166534; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin: 0 0 12px 0; letter-spacing: 0.5px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dashed #f3f4f6; padding-bottom: 4px; }
              .info-row:last-child { border-bottom: none; }
              .label { color: #6b7280; font-weight: 600; }
              .value { color: #111827; font-weight: 500; }
              .highlights { display: flex; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px 0; margin-bottom: 30px; }
              .highlight-item { flex: 1; text-align: center; border-right: 1px solid #bbf7d0; }
              .highlight-item:last-child { border-right: none; }
              .highlight-label { display: block; font-size: 10px; text-transform: uppercase; color: #166534; font-weight: 600; margin-bottom: 4px; }
              .highlight-value { font-family: 'Montserrat', sans-serif; font-size: 15px; font-weight: 700; color: #111827; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
              th { background: #166534; color: white; padding: 10px 12px; text-align: left; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
              td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .col-right { text-align: right; }
              .col-center { text-align: center; }
              .font-bold { font-weight: 700; }
              .totals-container { display: flex; justify-content: flex-end; margin-top: 10px; margin-bottom: 40px; }
              .totals-box { width: 50%; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
              .total-final { border-top: 2px solid #16a34a; margin-top: 10px; padding-top: 10px; color: #166534; font-size: 16px; font-weight: 800; font-family: 'Montserrat', sans-serif; }
              .text-green { color: #16a34a; }
              .terms-container { margin-top: auto; padding-top: 20px; }
              .terms-box { background: #fafafa; padding: 15px; border-radius: 6px; border: 1px solid #eee; font-size: 10px; color: #6b7280; text-align: justify; line-height: 1.5; margin-bottom: 30px; }
              .terms-title { font-weight: bold; text-transform: uppercase; margin-bottom: 5px; display: block; color: #374151; }
              .footer { text-align: center; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px; }
          </style>
      </head>
      <body>
          <div class="page">
              <div class="header">
                  <div class="brand-container">
                      ${logoHtml}
                      <div class="brand-text"><h1>${config.name}</h1><p>${config.address}<br>${config.phone} | ${config.email}</p></div>
                  </div>
                  <div class="doc-meta">
                      <h2 class="doc-title">${title}</h2>
                      <div class="doc-id">Emissão: ${today}</div>
                      ${!isBooking ? `<div class="doc-id">Validade: ${validUntilStr}</div>` : ''}
                      <span class="status-badge ${isBooking ? (remainingBalance <= 0 ? 'bg-paid' : 'bg-pending') : 'bg-proposal'}">
                          ${isBooking ? (remainingBalance <= 0 ? 'Totalmente Pago' : 'Pagamento Pendente') : 'Orçamento'}
                      </span>
                  </div>
              </div>

              <div class="highlights">
                  <div class="highlight-item"><span class="highlight-label">Check-in</span><span class="highlight-value">${fmtDate(tripInfo.checkIn)}</span></div>
                  <div class="highlight-item"><span class="highlight-label">Check-out</span><span class="highlight-value">${fmtDate(tripInfo.checkOut)}</span></div>
                  <div class="highlight-item"><span class="highlight-label">Dias de Pesca</span><span class="highlight-value">${tripInfo.fishingDays} Dias</span></div>
                  <div class="highlight-item"><span class="highlight-label">Pessoas</span><span class="highlight-value">${tripInfo.people} Pax</span></div>
              </div>

              <div class="grid-2">
                  <div class="box">
                      <h3>Dados do Responsável</h3>
                      <div class="info-row"><span class="label">Nome:</span><span class="value">${clientInfo.name}</span></div>
                      <div class="info-row"><span class="label">Telefone:</span><span class="value">${clientInfo.phone}</span></div>
                      <div class="info-row"><span class="label">Origem:</span><span class="value">${clientInfo.city}</span></div>
                  </div>
                  <div class="box">
                      <h3>Status da Reserva</h3>
                      <div class="info-row"><span class="label">Código:</span><span class="value">#${dealId ? dealId.substring(0,6).toUpperCase() : 'NOVO'}</span></div>
                      <div class="info-row"><span class="label">Local:</span><span class="value">Pantanal MT</span></div>
                  </div>
              </div>

              ${notes ? `
                  <div class="box" style="margin-bottom: 20px; background: #fffbeb; padding: 10px; border-radius: 4px; border: 1px solid #fcd34d;">
                      <h3 style="color: #92400e; border-bottom-color: #fcd34d;">Observações</h3>
                      <p style="font-size: 12px; color: #92400e; margin: 0;">${notes}</p>
                  </div>
              ` : ''}

              <div class="box">
                  <h3>Detalhamento do Pacote</h3>
                  <table>
                      <thead><tr><th style="width: 50%;">Descrição</th><th class="col-center">Qtd</th><th class="col-right">Unit.</th><th class="col-right">Total</th></tr></thead>
                      <tbody>
                          ${budgetItems.map(item => `
                              <tr>
                                  <td><div style="font-weight: 600;">${item.name}</div>${item.description ? `<div style="font-size: 11px; color: #6b7280;">${item.description}</div>` : ''}</td>
                                  <td class="col-center">${item.quantity}</td>
                                  <td class="col-right">R$ ${fmt(item.unitPrice)}</td>
                                  <td class="col-right font-bold">R$ ${fmt(item.totalPrice)}</td>
                              </tr>
                          `).join('')}
                      </tbody>
                  </table>
              </div>

              <div class="totals-container">
                  <div class="totals-box">
                      <div class="total-row"><span class="label">Subtotal:</span><span class="value">R$ ${fmt(totalBudget)}</span></div>
                      ${isBooking ? `<div class="total-row"><span class="label text-green">Total Pago:</span><span class="value text-green">(-) R$ ${fmt(totalPaid)}</span></div>` : ''}
                      <div class="total-row total-final"><span>${isBooking ? 'Saldo a Pagar:' : 'Valor Total:'}</span><span>R$ ${fmt(isBooking ? remainingBalance : totalBudget)}</span></div>
                  </div>
              </div>

              ${isBooking && payments.length > 0 ? `
                  <div class="box" style="margin-bottom: 30px;">
                      <h3>Histórico de Pagamentos</h3>
                      <table><thead><tr><th>Data</th><th>Método</th><th>Obs</th><th class="col-right">Valor</th></tr></thead>
                          <tbody>${payments.map(p => `<tr><td>${fmtDate(p.date)}</td><td>${p.method}</td><td>${p.notes || '-'}</td><td class="col-right">R$ ${fmt(p.amount)}</td></tr>`).join('')}</tbody>
                      </table>
                  </div>
              ` : ''}

              <div class="terms-container">
                  <div class="terms-box"><span class="terms-title">Termos</span>${config.policy}</div>
              </div>
              <div class="footer">Este documento foi gerado eletronicamente em ${today} através do sistema PescaGestor Pro.</div>
          </div>
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
                               placeholder="Ex: Translado Especial"
                               value={customItemName}
                               onChange={e => setCustomItemName(e.target.value)}
                            />
                            <input 
                               className="input-field text-xs"
                               placeholder="Descrição opcional..."
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
                          onChange={e => setItemPrice(parseFloat(e.target.value) || 0)}
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
                             <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total</th>
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
                    Confirmar e Imprimir
                  </button>
               ) : (
                  <button 
                    type="button" 
                    onClick={handleGenerateBudgetPDF} 
                    className="px-6 py-2 text-sm font-medium text-nature-700 dark:text-nature-300 bg-nature-50 dark:bg-nature-900/30 border border-nature-200 dark:border-nature-800 rounded-lg hover:bg-nature-100 dark:hover:bg-nature-900/50 flex items-center gap-2 mr-auto"
                  >
                    <FileDown size={18} />
                    Baixar/Imprimir PDF
                  </button>
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
                                if (checkinStep === 1 && selectedRooms.length === 0) {
                                    alert("Selecione pelo menos um quarto.");
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
