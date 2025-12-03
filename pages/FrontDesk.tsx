import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Reservation, ConsumptionItem, AllocatedRoom, Payment } from '../types';
import { CheckCircle, LogOut, PlusCircle, MinusCircle, Trash2, Printer, ChevronDown, ChevronUp, BedDouble, Plus, ArrowRight, Calendar, User, Ship, DollarSign } from 'lucide-react';

const FrontDesk = () => {
  const { reservations, addReservation, updateReservationStatus, products, handleConsumption, rooms, boats, guides, config } = useApp();
  const [expandedRes, setExpandedRes] = useState<string | null>(null);
  const [consumptionModal, setConsumptionModal] = useState<{ open: boolean, resId: string | null, roomId: string | null }>({ open: false, resId: null, roomId: null });

  // Manual Check-in State
  const [showManualCheckin, setShowManualCheckin] = useState(false);
  const [step, setStep] = useState(1);
  const [manualRes, setManualRes] = useState({
      mainContactName: '',
      contactPhone: '',
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: '',
      totalValue: 0,
      notes: ''
  });
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedBoats, setSelectedBoats] = useState<string[]>([]);
  const [selectedGuides, setSelectedGuides] = useState<string[]>([]);
  const [roomGuests, setRoomGuests] = useState<Record<string, {name: string, phone: string}[]>>({});
  
  // Payment during manual check-in
  const [initialPayment, setInitialPayment] = useState({
      amount: 0,
      method: 'Pix',
      notes: ''
  });

  // Filter active and confirmed for Front Desk actions
  const activeList = reservations.filter(r => r.status === 'checked-in' || r.status === 'confirmed');

  const handleStatusChange = (id: string, currentStatus: string) => {
    if (currentStatus === 'confirmed') {
       if (confirm('Atenção: Para realizar um Check-in completo com alocação de quartos, utilize a aba CRM. Deseja apenas marcar como hospedado?')) {
          updateReservationStatus(id, 'checked-in');
       }
    } else if (currentStatus === 'checked-in') {
      if (confirm('Confirmar Check-out e fechar conta?')) {
        updateReservationStatus(id, 'checked-out');
        alert('Conta fechada com sucesso! Resumo pronto para impressão.');
      }
    }
  };

  const handleAddProduct = (productId: string, qty: number) => {
    if (!consumptionModal.resId || !consumptionModal.roomId) return;
    handleConsumption(consumptionModal.resId, consumptionModal.roomId, productId, qty);
    setConsumptionModal({ open: false, resId: null, roomId: null });
  };

  const getRoomConsumptionTotal = (consumption: ConsumptionItem[]) => {
      return consumption.reduce((acc, item) => acc + item.total, 0);
  }

  const getTotalConsumption = (res: Reservation) => {
    return res.allocatedRooms.reduce((acc, room) => acc + getRoomConsumptionTotal(room.consumption), 0);
  };

  // --- Manual Check-in Logic ---

  const resetManualCheckin = () => {
      setShowManualCheckin(false);
      setStep(1);
      setManualRes({
          mainContactName: '',
          contactPhone: '',
          checkInDate: new Date().toISOString().split('T')[0],
          checkOutDate: '',
          totalValue: 0,
          notes: ''
      });
      setSelectedRooms([]);
      setSelectedBoats([]);
      setSelectedGuides([]);
      setRoomGuests({});
      setInitialPayment({ amount: 0, method: 'Pix', notes: '' });
  };

  const handleManualSubmit = () => {
    if (!manualRes.mainContactName) return alert("Nome do responsável é obrigatório");
    if (selectedRooms.length === 0) return alert("Selecione pelo menos um quarto");

    // Construct Allocated Rooms
    const allocatedRooms: AllocatedRoom[] = selectedRooms.map(roomId => {
        const room = rooms.find(r => r.id === roomId);
        const guests = roomGuests[roomId] || [];
        // Ensure at least empty list
        return {
            roomId: roomId,
            roomNumber: room?.number || '?',
            guests: guests,
            consumption: []
        };
    });

    // Construct Payment Object if amount > 0
    const payments = [];
    if (initialPayment.amount > 0) {
        payments.push({
            id: Math.random().toString(36).substr(2, 9),
            amount: initialPayment.amount,
            date: new Date().toISOString(),
            method: initialPayment.method,
            notes: initialPayment.notes || 'Pagamento no Check-in'
        });
    }

    const newReservation: Reservation = {
        id: Math.random().toString(36).substr(2, 9),
        mainContactName: manualRes.mainContactName,
        checkInDate: manualRes.checkInDate,
        checkOutDate: manualRes.checkOutDate,
        status: 'checked-in',
        allocatedRooms: allocatedRooms,
        boatIds: selectedBoats,
        guideIds: selectedGuides,
        totalPackageValue: manualRes.totalValue,
        paidAmount: initialPayment.amount,
        payments: payments,
        notes: manualRes.notes
    };

    addReservation(newReservation);
    resetManualCheckin();
  };

  const handlePrintExtract = (res: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const today = new Date().toLocaleDateString('pt-BR');
    const totalConsumption = getTotalConsumption(res);
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const logoHtml = config.logoUrl 
        ? `<img src="${config.logoUrl}" style="height: 80px; width: auto; object-fit: contain;" alt="Logo"/>`
        : `<div class="brand-name">${config.name}</div>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>Extrato de Consumo - ${res.mainContactName}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; font-family: 'Open Sans', sans-serif; color: #374151; }
              .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; box-sizing: border-box; }
              @media print { body { background: none; margin: 0; } .page { margin: 0; box-shadow: none; width: auto; height: auto; } }
              .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 25px; }
              .brand-container { display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 10px; }
              .brand-name { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 700; color: #166534; text-transform: uppercase; }
              .brand-info { font-size: 11px; color: #6b7280; margin-top: 5px; }
              .doc-title { text-align: center; font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; color: #16a34a; text-transform: uppercase; margin-bottom: 30px; border: 1px solid #16a34a; padding: 8px; border-radius: 4px; display: inline-block; }
              .title-container { text-align: center; }
              .client-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
              .info-group { display: flex; flex-direction: column; }
              .info-label { font-weight: 700; color: #6b7280; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
              .info-value { font-weight: 600; color: #111827; }
              
              .room-section { margin-bottom: 25px; page-break-inside: avoid; }
              .room-header { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 12px; border-radius: 6px 6px 0 0; display: flex; justify-content: space-between; align-items: center; }
              .room-title { font-family: 'Montserrat', sans-serif; font-weight: 700; color: #166534; font-size: 14px; }
              .room-guests { font-size: 11px; color: #15803d; }
              
              table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-top: none; }
              th { background: #f9fafb; font-size: 10px; text-transform: uppercase; color: #6b7280; padding: 8px; text-align: left; font-weight: 700; border-bottom: 1px solid #e5e7eb; }
              td { padding: 8px; font-size: 12px; color: #374151; border-bottom: 1px solid #f3f4f6; }
              tr:last-child td { border-bottom: none; }
              .col-right { text-align: right; }
              .col-center { text-align: center; }
              
              .subtotal-row { background: #fdfdfd; font-weight: 700; color: #111827; }
              .subtotal-label { text-align: right; padding-right: 15px; }
              
              .grand-total-box { margin-top: 30px; text-align: right; padding-top: 15px; border-top: 2px solid #16a34a; }
              .grand-total-label { font-size: 14px; font-weight: 600; color: #374151; margin-right: 10px; }
              .grand-total-value { font-size: 24px; font-weight: 800; color: #16a34a; font-family: 'Montserrat', sans-serif; }
              
              .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          </style>
      </head>
      <body>
          <div class="page">
              <div class="header">
                  <div class="brand-container">
                    ${logoHtml}
                  </div>
                  <div class="brand-info">${config.address} | ${config.phone}</div>
              </div>

              <div class="title-container">
                <div class="doc-title">Extrato de Consumo</div>
              </div>

              <div class="client-info">
                  <div class="info-group">
                      <span class="info-label">Responsável</span>
                      <span class="info-value">${res.mainContactName}</span>
                  </div>
                  <div class="info-group">
                      <span class="info-label">Check-in</span>
                      <span class="info-value">${new Date(res.checkInDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div class="info-group">
                      <span class="info-label">Check-out (Previsto)</span>
                      <span class="info-value">${new Date(res.checkOutDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div class="info-group">
                      <span class="info-label">Emissão</span>
                      <span class="info-value">${today}</span>
                  </div>
              </div>

              ${res.allocatedRooms.map(room => {
                  const roomTotal = getRoomConsumptionTotal(room.consumption);
                  return `
                      <div class="room-section">
                          <div class="room-header">
                              <span class="room-title">Quarto ${room.roomNumber}</span>
                              <span class="room-guests">${room.guests.map(g => g.name).join(', ')}</span>
                          </div>
                          <table>
                              <thead>
                                  <tr>
                                      <th style="width: 50%;">Item</th>
                                      <th class="col-center" style="width: 15%;">Qtd</th>
                                      <th class="col-right" style="width: 15%;">Unit.</th>
                                      <th class="col-right" style="width: 20%;">Total</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${room.consumption.length > 0 ? room.consumption.map(item => `
                                      <tr>
                                          <td>${item.productName}</td>
                                          <td class="col-center">${item.quantity}</td>
                                          <td class="col-right">R$ ${fmt(item.unitPrice)}</td>
                                          <td class="col-right">R$ ${fmt(item.total)}</td>
                                      </tr>
                                  `).join('') : `<tr><td colspan="4" style="text-align:center; color:#9ca3af; padding:15px;">Nenhum consumo registrado neste quarto.</td></tr>`}
                                  ${room.consumption.length > 0 ? `
                                      <tr class="subtotal-row">
                                          <td colspan="3" class="subtotal-label">Subtotal Quarto ${room.roomNumber}:</td>
                                          <td class="col-right">R$ ${fmt(roomTotal)}</td>
                                      </tr>
                                  ` : ''}
                              </tbody>
                          </table>
                      </div>
                  `;
              }).join('')}

              <div class="grand-total-box">
                  <span class="grand-total-label">TOTAL GERAL DE CONSUMO:</span>
                  <span class="grand-total-value">R$ ${fmt(totalConsumption)}</span>
              </div>

              <div class="footer">
                  Documento conferido eletronicamente. As despesas listadas referem-se aos itens de frigobar, bar e loja da pousada.
              </div>
          </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
             <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recepção & Consumo</h2>
             <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie estadias e lance consumos nas comandas por quarto.</p>
          </div>
          <button 
             onClick={() => setShowManualCheckin(true)}
             className="bg-nature-600 hover:bg-nature-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-sm"
          >
             <Plus size={20} />
             Novo Check-in (Manual)
          </button>
       </div>

       <div className="grid gap-6">
         {activeList.map(res => (
           <div key={res.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${res.status === 'confirmed' ? 'border-blue-200 dark:border-blue-900' : 'border-emerald-200 dark:border-emerald-900'} overflow-hidden transition-colors`}>
             {/* Main Card Header */}
             <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4 flex-1">
                   <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${res.status === 'confirmed' ? 'bg-blue-500' : 'bg-nature-600'}`}>
                      {res.mainContactName.charAt(0)}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{res.mainContactName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                         {res.status === 'confirmed' ? 'Chegada Prevista: ' : 'Hospedado desde: '} 
                         {new Date(res.checkInDate).toLocaleDateString('pt-BR')}
                      </p>
                   </div>
                </div>

                <div className="flex items-center space-x-4">
                   {res.status === 'checked-in' && (
                     <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs text-gray-400 uppercase">Total Geral</p>
                        <p className="font-bold text-lg text-nature-700 dark:text-nature-400">R$ {(res.totalPackageValue + getTotalConsumption(res)).toFixed(2)}</p>
                     </div>
                   )}
                   
                   <button 
                      onClick={() => handleStatusChange(res.id, res.status)}
                      className={`px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2
                         ${res.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-800'}`}
                   >
                      {res.status === 'confirmed' ? (
                        <> <CheckCircle size={18} /> Check-in </>
                      ) : (
                        <> <LogOut size={18} /> Check-out </>
                      )}
                   </button>
                   
                   <button 
                      onClick={() => setExpandedRes(expandedRes === res.id ? null : res.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                   >
                      {expandedRes === res.id ? <ChevronUp /> : <ChevronDown />}
                   </button>
                </div>
             </div>

             {/* Expanded Details - Room Breakdown */}
             {expandedRes === res.id && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700">
                   <div className="mb-4 flex flex-wrap justify-between items-end gap-4">
                      <div>
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Quartos & Consumo</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gerencie o consumo individualmente para cada quarto.</p>
                      </div>
                      <button 
                         onClick={() => handlePrintExtract(res)}
                         className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 shadow-sm"
                      >
                         <Printer size={16} /> Visualizar Extrato
                      </button>
                   </div>
                      
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                       {/* Loop through Allocated Rooms */}
                       {res.allocatedRooms.map((room, idx) => (
                           <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col">
                               <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                   <div>
                                       <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-white">
                                           <BedDouble size={16} className="text-nature-600 dark:text-nature-400"/>
                                           Quarto {room.roomNumber}
                                       </div>
                                       <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                           {room.guests.map(g => g.name).join(', ') || 'Sem hóspedes'}
                                       </div>
                                   </div>
                                   {res.status === 'checked-in' && (
                                       <button 
                                         onClick={() => setConsumptionModal({ open: true, resId: res.id, roomId: room.roomId })}
                                         className="bg-nature-50 dark:bg-nature-900/30 text-nature-700 dark:text-nature-400 hover:bg-nature-100 dark:hover:bg-nature-900/50 p-2 rounded-full" title="Adicionar Item"
                                       >
                                           <PlusCircle size={20} />
                                       </button>
                                   )}
                               </div>
                               
                               {/* Consumption List */}
                               <div className="flex-1 space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
                                   {room.consumption.length > 0 ? (
                                       room.consumption.map((item, cIdx) => (
                                           <div key={cIdx} className="flex flex-col border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0">
                                               <div className="flex justify-between items-center text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                   <span className="font-medium truncate pr-2">{item.productName}</span>
                                                   <span className="font-medium">R$ {item.total.toFixed(2)}</span>
                                               </div>
                                               <div className="flex justify-between items-center">
                                                   <span className="text-xs text-gray-400">R$ {item.unitPrice.toFixed(2)} un.</span>
                                                   {res.status === 'checked-in' && (
                                                       <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-0.5 border border-gray-200 dark:border-gray-600">
                                                           <button 
                                                             onClick={() => handleConsumption(res.id, room.roomId, item.productId, -1)}
                                                             className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded"
                                                           >
                                                               <MinusCircle size={14} />
                                                           </button>
                                                           <span className="text-xs font-bold w-5 text-center text-gray-700 dark:text-gray-200">{item.quantity}</span>
                                                           <button 
                                                             onClick={() => handleConsumption(res.id, room.roomId, item.productId, 1)}
                                                             className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 hover:bg-white dark:hover:bg-gray-600 rounded"
                                                           >
                                                               <PlusCircle size={14} />
                                                           </button>
                                                           <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                                           <button 
                                                             onClick={() => handleConsumption(res.id, room.roomId, item.productId, -item.quantity)}
                                                             className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-600 rounded"
                                                             title="Remover Item"
                                                           >
                                                               <Trash2 size={12} />
                                                           </button>
                                                       </div>
                                                   )}
                                               </div>
                                           </div>
                                       ))
                                   ) : (
                                       <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                         Nenhum consumo
                                       </p>
                                   )}
                               </div>

                               <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 -mx-4 -mb-4 p-3 rounded-b-lg">
                                   <span className="text-xs uppercase text-gray-500 dark:text-gray-400">Total Quarto</span>
                                   <span>R$ {getRoomConsumptionTotal(room.consumption).toFixed(2)}</span>
                               </div>
                           </div>
                       ))}
                   </div>

                   {/* General Details */}
                   <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-6">
                       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                           <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 border-b dark:border-gray-700 pb-2">Recursos Globais Alocados</h4>
                           <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                               <p className="flex justify-between">
                                  <span>Barcos:</span> 
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{res.boatIds.length > 0 ? res.boatIds.length + ' Barcos' : '-'}</span>
                               </p>
                               <p className="flex justify-between">
                                  <span>Guias:</span> 
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{res.guideIds.length > 0 ? res.guideIds.length + ' Guias' : '-'}</span>
                               </p>
                               <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-100 dark:border-yellow-900/50 mt-2">
                                  <p className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase mb-1">Observações</p>
                                  <p className="text-xs text-yellow-900 dark:text-yellow-300 italic">{res.notes || 'Nenhuma observação registrada.'}</p>
                               </div>
                           </div>
                           {/* Payment History Table */}
                           {res.payments && res.payments.length > 0 && (
                               <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                   <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-xs uppercase">Histórico de Pagamentos</h4>
                                   <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2 text-xs text-gray-700 dark:text-gray-300">
                                      {res.payments.map((p, i) => (
                                          <div key={i} className="flex justify-between border-b border-gray-200 dark:border-gray-600 last:border-0 py-1">
                                              <span>{new Date(p.date).toLocaleDateString('pt-BR')} ({p.method})</span>
                                              <span className="font-bold">R$ {p.amount.toFixed(2)}</span>
                                          </div>
                                      ))}
                                   </div>
                               </div>
                           )}
                       </div>

                       <div className="bg-nature-50 dark:bg-nature-900/20 rounded-lg p-5 border border-nature-100 dark:border-nature-800">
                           <h4 className="font-bold text-nature-900 dark:text-nature-300 mb-4 flex items-center gap-2">
                             <div className="w-2 h-2 bg-nature-500 rounded-full"></div>
                             Resumo Financeiro da Reserva
                           </h4>
                           
                           <div className="space-y-2 text-sm mb-4">
                               <div className="flex justify-between items-center">
                                   <span className="text-gray-600 dark:text-gray-400">Pacote de Hospedagem:</span>
                                   <span className="font-semibold text-gray-900 dark:text-white">R$ {res.totalPackageValue.toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span className="text-gray-600 dark:text-gray-400">Total Consumo (Todos os quartos):</span>
                                   <span className="font-semibold text-gray-900 dark:text-white">R$ {getTotalConsumption(res).toFixed(2)}</span>
                               </div>
                               <div className="flex justify-between items-center text-green-700 dark:text-green-400 font-medium pt-2 border-t border-nature-200 dark:border-nature-800">
                                   <span>Valor Já Pago:</span>
                                   <span>(-) R$ {res.paidAmount.toFixed(2)}</span>
                               </div>
                           </div>

                           <div className="flex justify-between items-end bg-white dark:bg-gray-800 p-3 rounded border border-nature-200 dark:border-nature-700">
                               <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Saldo Restante</span>
                               <span className={`text-xl font-bold ${(res.totalPackageValue + getTotalConsumption(res) - res.paidAmount) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                   R$ {(res.totalPackageValue + getTotalConsumption(res) - res.paidAmount).toFixed(2)}
                               </span>
                           </div>
                       </div>
                   </div>
                </div>
             )}
           </div>
         ))}
         {activeList.length === 0 && (
             <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma reserva ativa ou check-in pendente para hoje.</p>
         )}
       </div>

       {/* Consumption Modal */}
       {consumptionModal.open && consumptionModal.roomId && (
         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lançar Consumo</h3>
                    <span className="text-xs bg-nature-100 dark:bg-nature-900 text-nature-800 dark:text-nature-300 px-2 py-1 rounded-full font-bold">
                        Quarto {rooms.find(r => r.id === consumptionModal.roomId)?.number}
                    </span>
                 </div>
                 
                 <div className="max-h-64 overflow-y-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                             <tr>
                                 <th className="p-2">Produto</th>
                                 <th className="p-2">Preço</th>
                                 <th className="p-2 text-right">Ação</th>
                             </tr>
                         </thead>
                         <tbody className="text-gray-800 dark:text-gray-200">
                             {products.map(p => (
                                 <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                     <td className="p-2">
                                         <div className="font-medium">{p.name}</div>
                                         <div className="text-xs text-gray-400 dark:text-gray-500">{p.category}</div>
                                     </td>
                                     <td className="p-2">R$ {p.price.toFixed(2)}</td>
                                     <td className="p-2 text-right">
                                         <button 
                                            onClick={() => handleAddProduct(p.id, 1)}
                                            className="bg-nature-600 text-white hover:bg-nature-700 px-3 py-1 rounded text-xs font-bold"
                                         >
                                             Adicionar
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
                 <div className="mt-4 flex justify-end">
                     <button onClick={() => setConsumptionModal({open:false, resId:null, roomId: null})} className="text-gray-500 dark:text-gray-400 text-sm underline hover:text-gray-700 dark:hover:text-gray-200">Cancelar</button>
                 </div>
             </div>
         </div>
       )}

       {/* MANUAL CHECK-IN WIZARD */}
       {showManualCheckin && (
           <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-nature-600 rounded-t-xl text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">Novo Check-in Manual</h3>
                            <p className="text-nature-100 text-sm">Preencha os dados da estadia e pagamento</p>
                        </div>
                        <div className="text-right text-sm opacity-80">
                            Passo {step} de 4
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">1. Dados Básicos & Recursos</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nome Responsável</label>
                                        <input className="input-field" placeholder="Nome completo" value={manualRes.mainContactName} onChange={e => setManualRes({...manualRes, mainContactName: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Telefone</label>
                                        <input className="input-field" placeholder="(00) 00000-0000" value={manualRes.contactPhone} onChange={e => setManualRes({...manualRes, contactPhone: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Check-in</label>
                                        <input type="date" className="input-field" value={manualRes.checkInDate} onChange={e => setManualRes({...manualRes, checkInDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="label">Check-out</label>
                                        <input type="date" className="input-field" value={manualRes.checkOutDate} onChange={e => setManualRes({...manualRes, checkOutDate: e.target.value})} />
                                    </div>
                                </div>
                                
                                {/* Rooms Selection (Simplified) */}
                                <div>
                                    <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><BedDouble size={18}/> Quartos</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {rooms.map(room => (
                                            <label key={room.id} className={`border p-3 rounded-lg flex items-center gap-3 cursor-pointer ${selectedRooms.includes(room.id) ? 'border-nature-500 bg-nature-50 dark:bg-nature-900/30' : 'border-gray-200 dark:border-gray-700 opacity-80'}`}>
                                                <input type="checkbox" checked={selectedRooms.includes(room.id)} onChange={e => e.target.checked ? setSelectedRooms([...selectedRooms, room.id]) : setSelectedRooms(selectedRooms.filter(id => id !== room.id))} />
                                                <div className="text-sm dark:text-gray-200"><b>#{room.number}</b> {room.name}</div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">2. Barcos e Guias</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Ship size={18}/> Barcos</h5>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {boats.map(boat => (
                                                <label key={boat.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                    <input type="checkbox" checked={selectedBoats.includes(boat.id)} onChange={e => e.target.checked ? setSelectedBoats([...selectedBoats, boat.id]) : setSelectedBoats(selectedBoats.filter(id => id !== boat.id))} />
                                                    <span className="text-sm dark:text-gray-300">{boat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><User size={18}/> Guias</h5>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {guides.map(guide => (
                                                <label key={guide.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                                    <input type="checkbox" checked={selectedGuides.includes(guide.id)} onChange={e => e.target.checked ? setSelectedGuides([...selectedGuides, guide.id]) : setSelectedGuides(selectedGuides.filter(id => id !== guide.id))} />
                                                    <span className="text-sm dark:text-gray-300">{guide.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">3. Hóspedes por Quarto</h4>
                                {selectedRooms.map(roomId => {
                                    const room = rooms.find(r => r.id === roomId);
                                    const guests = roomGuests[roomId] || [];
                                    return (
                                        <div key={roomId} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold dark:text-white">Quarto {room?.number}</span>
                                                <button onClick={() => setRoomGuests({...roomGuests, [roomId]: [...guests, {name:'', phone:''}]})} className="text-xs bg-white dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded border dark:border-gray-600 shadow-sm">+ Hóspede</button>
                                            </div>
                                            {guests.map((g, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <input placeholder="Nome" className="input-field py-1" value={g.name} onChange={e => {
                                                        const newG = [...guests]; newG[idx].name = e.target.value;
                                                        setRoomGuests({...roomGuests, [roomId]: newG});
                                                    }} />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">4. Financeiro e Pagamento</h4>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <label className="label text-blue-800 dark:text-blue-300">Valor Total do Pacote (R$)</label>
                                    <input type="number" className="input-field text-xl font-bold text-blue-900 dark:text-blue-200 bg-white dark:bg-gray-800" placeholder="0.00" value={manualRes.totalValue} onChange={e => setManualRes({...manualRes, totalValue: parseFloat(e.target.value) || 0})} />
                                </div>

                                <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><DollarSign size={18}/> Pagamento Inicial / Sinal</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Valor Pago Agora (R$)</label>
                                            <input type="number" className="input-field" value={initialPayment.amount} onChange={e => setInitialPayment({...initialPayment, amount: parseFloat(e.target.value) || 0})} />
                                        </div>
                                        <div>
                                            <label className="label">Forma de Pagamento</label>
                                            <select className="input-field" value={initialPayment.method} onChange={e => setInitialPayment({...initialPayment, method: e.target.value})}>
                                                <option value="Pix">Pix</option>
                                                <option value="Cartão Crédito">Cartão Crédito</option>
                                                <option value="Dinheiro">Dinheiro</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="label">Observações</label>
                                            <input className="input-field" placeholder="Detalhes do pagamento..." value={initialPayment.notes} onChange={e => setInitialPayment({...initialPayment, notes: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex justify-between">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Voltar</button>
                        ) : (
                            <button onClick={resetManualCheckin} className="px-6 py-2 text-red-600 dark:text-red-400 hover:underline">Cancelar</button>
                        )}
                        
                        {step < 4 ? (
                            <button onClick={() => setStep(step + 1)} className="px-6 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold flex items-center gap-2">Próximo <ArrowRight size={16}/></button>
                        ) : (
                            <button onClick={handleManualSubmit} className="px-8 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold flex items-center gap-2"><CheckCircle size={18}/> Finalizar Check-in</button>
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

export default FrontDesk;