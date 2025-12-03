
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Reservation, Deal } from '../types';
import { Calendar, Plus, Filter, User, Anchor, X, Check, FileDown, Search } from 'lucide-react';

const Reservations = () => {
  const { reservations, rooms, boats, guides, addReservation, deals, config } = useApp();
  const [showModal, setShowModal] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [rangeType, setRangeType] = useState<'all' | '7' | '15' | '30' | '60' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Auto-complete state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [newRes, setNewRes] = useState<any>({
    guestName: '',
    checkInDate: '',
    checkOutDate: '',
    roomIds: [],
    boatIds: [],
    guideIds: [],
    totalValue: 0
  });

  // Helper to add days to today
  const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0];

  // Calculate effective Date Range for Filter & PDF
  const getEffectiveDateRange = () => {
      let start = today;
      let end = '';
      let label = 'Todos os Períodos';

      if (rangeType === 'all') {
          return { start: null, end: null, label };
      }

      if (rangeType === 'custom') {
          start = customStart;
          end = customEnd;
          if (start && end) label = `${new Date(start).toLocaleDateString('pt-BR')} a ${new Date(end).toLocaleDateString('pt-BR')}`;
          else label = 'Período Personalizado (Incompleto)';
      } else {
          end = getFutureDate(parseInt(rangeType));
          label = `Próximos ${rangeType} dias (${new Date(start).toLocaleDateString('pt-BR')} a ${new Date(end).toLocaleDateString('pt-BR')})`;
      }

      return { start, end, label };
  };

  const { start: filterStart, end: filterEnd, label: filterLabel } = getEffectiveDateRange();

  // Filter Logic
  const filteredReservations = reservations.filter(res => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = res.mainContactName.toLowerCase().includes(searchLower);
      
      let matchesDate = true;

      // Logic: Overlap Check (StartA <= EndB) and (EndA >= StartB)
      if (filterStart && filterEnd) {
         matchesDate = (res.checkInDate <= filterEnd) && (res.checkOutDate >= filterStart);
      }

      return matchesSearch && matchesDate;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create Allocated Rooms based on selection
    const allocatedRooms = (newRes.roomIds || []).map((rid: string) => {
        const r = rooms.find(room => room.id === rid);
        return {
            roomId: rid,
            roomNumber: r?.number || '?',
            guests: [{ name: newRes.guestName }], // Default guest
            consumption: []
        };
    });

    const reservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      mainContactName: newRes.guestName,
      checkInDate: newRes.checkInDate,
      checkOutDate: newRes.checkOutDate,
      status: 'confirmed',
      allocatedRooms: allocatedRooms,
      boatIds: newRes.boatIds || [],
      guideIds: newRes.guideIds || [],
      totalPackageValue: newRes.totalValue || 0,
      paidAmount: 0,
      payments: [],
      notes: ''
    };

    addReservation(reservation);
    setShowModal(false);
    setNewRes({ guestName: '', checkInDate: '', checkOutDate: '', roomIds: [], boatIds: [], guideIds: [], totalValue: 0 });
  };

  const handleMultiSelect = (type: 'roomIds' | 'boatIds' | 'guideIds', id: string) => {
    const current = newRes[type] || [];
    if (current.includes(id)) {
      setNewRes({ ...newRes, [type]: current.filter((x: string) => x !== id) });
    } else {
      setNewRes({ ...newRes, [type]: [...current, id] });
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectDeal = (deal: Deal) => {
      setNewRes({
          ...newRes,
          guestName: deal.contactName,
          checkInDate: deal.budget?.checkInDate || '',
          checkOutDate: deal.budget?.checkOutDate || '',
          totalValue: deal.value || 0
      });
      setShowSuggestions(false);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalFilteredValue = filteredReservations.reduce((acc, curr) => acc + curr.totalPackageValue, 0);
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

    // Logo Logic
    const logoHtml = config.logoUrl 
        ? `<img src="${config.logoUrl}" style="height: 60px; width: auto; object-fit: contain;" alt="Logo"/>`
        : `<h1 style="font-family: 'Montserrat', sans-serif; font-size: 20px; color: #166534; text-transform: uppercase; margin: 0;">Relatório de Reservas</h1>`;


    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>Relatório de Reservas</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; font-family: 'Open Sans', sans-serif; color: #374151; }
              .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; box-sizing: border-box; }
              .header { border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
              .title { display: flex; flex-direction: column; }
              .title h1 { font-family: 'Montserrat', sans-serif; font-size: 20px; color: #166534; text-transform: uppercase; margin: 0; }
              .title p { font-size: 11px; color: #6b7280; margin: 2px 0 0; }
              .meta { text-align: right; font-size: 11px; color: #4b5563; }
              
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background: #f0fdf4; color: #166534; font-size: 10px; text-transform: uppercase; padding: 8px; text-align: left; font-weight: 700; border-bottom: 1px solid #16a34a; }
              td { padding: 8px; font-size: 11px; color: #374151; border-bottom: 1px solid #e5e7eb; }
              tr:nth-child(even) { background-color: #f9fafb; }
              .col-right { text-align: right; }
              .col-center { text-align: center; }
              
              .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
              .status-confirmed { background: #eff6ff; color: #1d4ed8; }
              .status-checked-in { background: #f0fdf4; color: #15803d; }
              .status-checked-out { background: #f3f4f6; color: #4b5563; }
              .status-cancelled { background: #fef2f2; color: #b91c1c; }

              .footer-summary { margin-top: 30px; display: flex; justify-content: flex-end; }
              .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; width: 40%; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
              .summary-total { border-top: 1px solid #d1d5db; margin-top: 5px; padding-top: 5px; font-weight: 700; font-size: 14px; color: #16a34a; }

              .print-footer { position: fixed; bottom: 10mm; left: 0; width: 100%; text-align: center; font-size: 9px; color: #9ca3af; }
          </style>
      </head>
      <body>
          <div class="page">
              <div class="header">
                  <div class="title">
                      ${logoHtml}
                      ${config.logoUrl ? '<h2 style="font-family: \'Montserrat\', sans-serif; font-size: 16px; color: #166534; text-transform: uppercase; margin: 5px 0 0 0;">Relatório de Reservas</h2>' : ''}
                      <p>Filtro: ${filterLabel}</p>
                  </div>
                  <div class="meta">
                      ${config.name}<br>
                      Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}<br>
                      Registros encontrados: ${filteredReservations.length}
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th>Hóspede</th>
                          <th style="width: 25%">Período</th>
                          <th>Quartos</th>
                          <th>Status</th>
                          <th class="col-right">Valor Pacote</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${filteredReservations.map(res => `
                          <tr>
                              <td><strong>${res.mainContactName}</strong></td>
                              <td>${fmtDate(res.checkInDate)} até ${fmtDate(res.checkOutDate)}</td>
                              <td>${res.allocatedRooms.length > 0 ? res.allocatedRooms.map(r => r.roomNumber).join(', ') : '-'}</td>
                              <td>
                                  <span class="status-badge status-${res.status}">
                                      ${res.status === 'confirmed' ? 'Confirmada' : 
                                        res.status === 'checked-in' ? 'Hospedado' :
                                        res.status === 'checked-out' ? 'Finalizada' : 'Cancelada'}
                                  </span>
                              </td>
                              <td class="col-right">R$ ${fmt(res.totalPackageValue)}</td>
                          </tr>
                      `).join('')}
                      ${filteredReservations.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum registro encontrado para o período selecionado.</td></tr>' : ''}
                  </tbody>
              </table>

              <div class="footer-summary">
                  <div class="summary-box">
                      <div class="summary-row">
                          <span>Qtd. Reservas:</span>
                          <span>${filteredReservations.length}</span>
                      </div>
                      <div class="summary-row summary-total">
                          <span>Valor Total (Filtrado):</span>
                          <span>R$ ${fmt(totalFilteredValue)}</span>
                      </div>
                  </div>
              </div>

              <div class="print-footer">
                  Sistema PescaGestor Pro - Relatório Gerencial
              </div>
          </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const FilterButton = ({ label, value }: { label: string, value: typeof rangeType }) => (
      <button 
        onClick={() => setRangeType(value)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
            rangeType === value 
            ? 'bg-nature-600 text-white border-nature-600' 
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        }`}
      >
          {label}
      </button>
  );

  // Filter deals for suggestions (Active deals that have budget details potentially)
  const suggestedDeals = deals.filter(d => 
     ['new', 'waiting', 'reservation'].includes(d.stage) &&
     d.contactName.toLowerCase().includes(newRes.guestName.toLowerCase()) &&
     newRes.guestName.length > 0
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>
            <p className="text-gray-500 text-sm">Controle de agenda, disponibilidade e pacotes.</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
                onClick={handlePrintReport}
                disabled={filteredReservations.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm border transition-colors
                    ${filteredReservations.length === 0 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
                <FileDown size={20} />
                Exportar Relatório
            </button>
            <button 
                onClick={() => setShowModal(true)}
                className="bg-nature-600 hover:bg-nature-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-transform hover:scale-105"
            >
                <Plus size={20} />
                Nova Reserva
            </button>
         </div>
       </div>

       {/* List View */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col gap-4">
             {/* Search Bar */}
             <div className="relative w-full md:w-1/3">
                <input 
                    placeholder="Buscar hóspede por nome..." 
                    className="w-full pl-9 pr-4 py-2 border border-gray-400 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-nature-500 focus:border-nature-500 outline-none font-medium" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Filter className="absolute left-3 top-2.5 text-gray-500" size={16} />
             </div>

             {/* Date Filters */}
             <div className="flex flex-wrap items-center gap-2">
                 <span className="text-sm font-bold text-gray-600 mr-2 flex items-center gap-1">
                    <Calendar size={16}/> Período:
                 </span>
                 <FilterButton label="Todas" value="all" />
                 <FilterButton label="Próx 7 dias" value="7" />
                 <FilterButton label="Próx 15 dias" value="15" />
                 <FilterButton label="Próx 30 dias" value="30" />
                 <FilterButton label="Próx 60 dias" value="60" />
                 <FilterButton label="Personalizado" value="custom" />
             </div>

             {/* Custom Date Inputs */}
             {rangeType === 'custom' && (
                 <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 w-fit">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Data Início</label>
                        <input 
                            type="date" 
                            className="border border-gray-400 rounded px-2 py-1 text-sm text-gray-900 outline-none" 
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                        />
                    </div>
                    <span className="text-gray-400 mt-3">-</span>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Data Fim</label>
                        <input 
                            type="date" 
                            className="border border-gray-400 rounded px-2 py-1 text-sm text-gray-900 outline-none" 
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                        />
                    </div>
                 </div>
             )}
          </div>

          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hóspede</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recursos</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.length > 0 ? (
                    filteredReservations.map(res => (
                   <tr key={res.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-nature-100 flex items-center justify-center text-nature-600 font-bold text-xs mr-3 border border-nature-200">
                               {res.mainContactName.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-gray-900">{res.mainContactName}</div>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                         {new Date(res.checkInDate).toLocaleDateString('pt-BR')} até {new Date(res.checkOutDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                         <div className="flex gap-2">
                            {res.allocatedRooms.length > 0 && <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs" title="Quartos">🛏️ {res.allocatedRooms.length}</span>}
                            {res.boatIds.length > 0 && <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs" title="Barcos"><Anchor size={12} className="mr-1"/>{res.boatIds.length}</span>}
                            {res.guideIds.length > 0 && <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs" title="Guias"><User size={12} className="mr-1"/>{res.guideIds.length}</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border 
                            ${res.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              res.status === 'checked-in' ? 'bg-green-50 text-green-700 border-green-200' : 
                              res.status === 'checked-out' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {res.status === 'confirmed' ? 'Confirmada' : 
                             res.status === 'checked-in' ? 'Hospedado' :
                             res.status === 'checked-out' ? 'Finalizada' : 'Cancelada'}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                         R$ {res.totalPackageValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </td>
                   </tr>
                ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                                <Calendar size={48} className="text-gray-300 mb-2"/>
                                <p className="font-medium">Nenhuma reserva encontrada</p>
                                <p className="text-xs">Tente alterar os filtros de período ou busca.</p>
                            </div>
                        </td>
                    </tr>
                )}
             </tbody>
          </table>
       </div>

       {/* Modal Create Reservation */}
       {showModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8">
               <div className="flex justify-between items-center mb-6 pb-4 border-b">
                   <h3 className="text-xl font-bold text-gray-800">Nova Reserva Manual</h3>
                   <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                       <X size={24} />
                   </button>
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="relative" ref={dropdownRef}>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Responsável / Buscar Cliente</label>
                     <div className="relative">
                        <input 
                            required 
                            autoComplete="off"
                            placeholder="Digite para buscar clientes..."
                            className="w-full border border-gray-400 rounded-lg p-2.5 pl-9 text-gray-900 font-medium focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none" 
                            value={newRes.guestName} 
                            onChange={e => {
                                setNewRes({...newRes, guestName: e.target.value});
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                     </div>
                     
                     {/* Search Suggestions Dropdown */}
                     {showSuggestions && suggestedDeals.length > 0 && (
                        <div className="absolute z-20 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {suggestedDeals.map(deal => (
                                <div 
                                    key={deal.id} 
                                    className="p-3 hover:bg-nature-50 cursor-pointer border-b border-gray-100 last:border-0"
                                    onClick={() => handleSelectDeal(deal)}
                                >
                                    <div className="font-bold text-sm text-gray-800">{deal.contactName}</div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span className={`uppercase font-bold ${deal.stage==='reservation'?'text-indigo-600':'text-gray-400'}`}>
                                            {deal.stage === 'new' ? 'Novo Orç.' : deal.stage === 'waiting' ? 'Aguardando' : 'Reserva Pendente'}
                                        </span>
                                        <span>
                                            {deal.budget?.checkInDate ? new Date(deal.budget.checkInDate).toLocaleDateString('pt-BR') : 'Sem data'} 
                                            <span className="font-bold text-gray-700 ml-2">R$ {deal.value.toLocaleString('pt-BR')}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Data Check-in</label>
                        <input required type="date" className="w-full border border-gray-400 rounded-lg p-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none" value={newRes.checkInDate} onChange={e => setNewRes({...newRes, checkInDate: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Data Check-out</label>
                        <input required type="date" className="w-full border border-gray-400 rounded-lg p-2.5 text-gray-900 font-medium focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none" value={newRes.checkOutDate} onChange={e => setNewRes({...newRes, checkOutDate: e.target.value})} />
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                     <div>
                        <span className="block text-sm font-bold mb-3 text-gray-700 uppercase">Quartos</span>
                        <div className="h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                           {rooms.map(r => (
                              <label key={r.id} className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-white p-1 rounded cursor-pointer">
                                 <input type="checkbox" className="rounded text-nature-600 focus:ring-nature-500" checked={newRes.roomIds?.includes(r.id)} onChange={() => handleMultiSelect('roomIds', r.id)} />
                                 <span>{r.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                     <div>
                        <span className="block text-sm font-bold mb-3 text-gray-700 uppercase">Barcos</span>
                        <div className="h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                           {boats.map(b => (
                              <label key={b.id} className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-white p-1 rounded cursor-pointer">
                                 <input type="checkbox" className="rounded text-nature-600 focus:ring-nature-500" checked={newRes.boatIds?.includes(b.id)} onChange={() => handleMultiSelect('boatIds', b.id)} />
                                 <span>{b.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                     <div>
                        <span className="block text-sm font-bold mb-3 text-gray-700 uppercase">Guias</span>
                        <div className="h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                           {guides.map(g => (
                              <label key={g.id} className="flex items-center space-x-2 text-sm text-gray-700 hover:bg-white p-1 rounded cursor-pointer">
                                 <input type="checkbox" className="rounded text-nature-600 focus:ring-nature-500" checked={newRes.guideIds?.includes(g.id)} onChange={() => handleMultiSelect('guideIds', g.id)} />
                                 <span>{g.name}</span>
                              </label>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1">Valor Total do Pacote (R$)</label>
                     <input required type="number" step="0.01" className="w-full border border-gray-400 rounded-lg p-2.5 text-gray-900 font-bold focus:ring-2 focus:ring-nature-500 focus:border-transparent outline-none" value={newRes.totalValue} onChange={e => setNewRes({...newRes, totalValue: parseFloat(e.target.value)})} />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                     <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">Cancelar</button>
                     <button type="submit" className="px-5 py-2.5 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold flex items-center gap-2">
                        <Check size={18} /> Confirmar Reserva
                     </button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
};

export default Reservations;
