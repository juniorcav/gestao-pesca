
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Reservation, ConsumptionItem, AllocatedRoom, Payment, BudgetItemTemplate } from '../types';
import { 
  CheckCircle, LogOut, PlusCircle, MinusCircle, Trash2, Printer, 
  ChevronDown, ChevronUp, BedDouble, Plus, ArrowRight, 
  Calendar, User, Ship, DollarSign, Grid, List, Search, AlertCircle, Eye, X, Users, Anchor, Zap, Save, FileText, Coffee, Package, CreditCard
} from 'lucide-react';

const FrontDesk = () => {
  const { 
    reservations, addReservation, updateReservation, updateReservationStatus, 
    products, handleConsumption, rooms, boats, guides, config, budgetTemplates
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATES FOR MODALS ---
  
  // Detalhes do Quarto (Room Detail Modal)
  const [roomDetailModal, setRoomDetailModal] = useState<{ open: boolean, reservationId: string | null, roomId: string | null }>({ open: false, reservationId: null, roomId: null });
  const [qtyInput, setQtyInput] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState('');
  
  // Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<{ open: boolean, reservation: Reservation | null }>({ open: false, reservation: null });
  const [checkoutPayment, setCheckoutPayment] = useState({ amount: 0, method: 'Pix', notes: '' });
  const [checkoutPaymentsList, setCheckoutPaymentsList] = useState<Payment[]>([]);

  // Partial Payment Modal State (New)
  const [partialPaymentModal, setPartialPaymentModal] = useState<{ open: boolean, reservationId: string | null }>({ open: false, reservationId: null });
  const [partialPayment, setPartialPayment] = useState({ amount: 0, method: 'Pix', notes: '' });

  // Add Room Modal State
  const [addRoomModal, setAddRoomModal] = useState<{ open: boolean, reservationId: string | null }>({ open: false, reservationId: null });
  const [selectedRoomToAdd, setSelectedRoomToAdd] = useState('');
  // State for upgrade items
  const [upgradeItems, setUpgradeItems] = useState<{templateId: string, quantity: number, price: number}[]>([]);

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
  
  const [initialPaymentInput, setInitialPaymentInput] = useState({ amount: 0, method: 'Pix', notes: '' });
  const [manualPaymentsList, setManualPaymentsList] = useState<Payment[]>([]);

  // --- DERIVED STATE ---
  const activeRes = reservations.find(r => r.id === roomDetailModal.reservationId);
  const activeRoom = activeRes?.allocatedRooms.find(r => r.roomId === roomDetailModal.roomId);

  // --- Helpers ---
  const getRoomConsumptionTotal = (consumption: ConsumptionItem[]) => consumption.reduce((acc, item) => acc + item.total, 0);
  const getTotalConsumption = (res: Reservation) => res.allocatedRooms.reduce((acc, room) => acc + getRoomConsumptionTotal(room.consumption), 0);
  
  const activeList = reservations.filter(r => 
    (r.status === 'checked-in' || r.status === 'confirmed') &&
    r.mainContactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const occupiedRoomIds = new Set(reservations
    .filter(r => r.status === 'checked-in')
    .flatMap(r => r.allocatedRooms.map(ar => ar.roomId)));

  const availableRooms = rooms.filter(room => !occupiedRoomIds.has(room.id));
  
  const occupiedBoatIds = new Set(reservations
    .filter(r => r.status === 'checked-in')
    .flatMap(r => r.boatIds));
  const availableBoats = boats.filter(b => !occupiedBoatIds.has(b.id));

  // --- Actions ---

  const handleStatusChange = (res: Reservation) => {
    if (res.status === 'confirmed') {
       if (confirm(`Confirmar entrada de ${res.mainContactName}?`)) {
          updateReservationStatus(res.id, 'checked-in');
       }
    } else if (res.status === 'checked-in') {
       setCheckoutPayment({ amount: 0, method: 'Pix', notes: '' });
       setCheckoutPaymentsList([]);
       setCheckoutModal({ open: true, reservation: res });
    }
  };

  const handleOpenPartialPayment = (resId: string) => {
      setPartialPayment({ amount: 0, method: 'Pix', notes: '' });
      setPartialPaymentModal({ open: true, reservationId: resId });
  };

  const handleSavePartialPayment = async () => {
      if (!partialPaymentModal.reservationId || partialPayment.amount <= 0) return;
      const res = reservations.find(r => r.id === partialPaymentModal.reservationId);
      if (res) {
          const newPayment: Payment = {
              id: Math.random().toString(36).substr(2, 9),
              amount: partialPayment.amount,
              date: new Date().toISOString(),
              method: partialPayment.method,
              notes: partialPayment.notes || 'Pagamento Parcial'
          };
          
          const updatedRes: Reservation = {
              ...res,
              payments: [...(res.payments || []), newPayment],
              paidAmount: res.paidAmount + partialPayment.amount
          };
          
          await updateReservation(updatedRes);
          alert(`Pagamento de R$ ${partialPayment.amount} registrado com sucesso!`);
      }
      setPartialPaymentModal({ open: false, reservationId: null });
  };

  const addCheckoutPayment = () => {
    if (checkoutPayment.amount <= 0) return;
    
    const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        amount: checkoutPayment.amount,
        date: new Date().toISOString(),
        method: checkoutPayment.method,
        notes: checkoutPayment.notes || 'Pgto no Fechamento'
    };
    
    setCheckoutPaymentsList([...checkoutPaymentsList, newPayment]);
    setCheckoutPayment({ ...checkoutPayment, amount: 0, notes: '' });
  };

  const removeCheckoutPayment = (id: string) => {
    setCheckoutPaymentsList(checkoutPaymentsList.filter(p => p.id !== id));
  };

  const processCheckout = async () => {
      if (!checkoutModal.reservation) return;
      
      const allPayments = [
          ...(checkoutModal.reservation.payments || []),
          ...checkoutPaymentsList
      ];
      
      const newPaidAmount = allPayments.reduce((acc, p) => acc + p.amount, 0);

      const updatedRes: Reservation = {
          ...checkoutModal.reservation,
          payments: allPayments,
          paidAmount: newPaidAmount,
          status: 'checked-out'
      };

      await updateReservation(updatedRes);
      
      setCheckoutModal({ open: false, reservation: null });
      setCheckoutPaymentsList([]);
      alert("Check-out realizado com sucesso!");
  };

  const handleAddConsumption = () => {
    if (!activeRes || !activeRoom || !selectedProduct) return;
    
    handleConsumption(
        activeRes.id, 
        activeRoom.roomId, 
        selectedProduct, 
        qtyInput
    );
    
    setQtyInput(1);
    setSelectedProduct('');
  };

  const handleRemoveConsumption = (productId: string) => {
      if (!activeRes || !activeRoom) return;
      const currentItem = activeRoom.consumption.find(c => c.productId === productId);
      if (currentItem) {
          handleConsumption(activeRes.id, activeRoom.roomId, productId, -currentItem.quantity);
      }
  };

  // --- ADD ROOM / CONSUMPTION LOGIC ---
  const handleAddUpgradeItem = (template: BudgetItemTemplate) => {
      const existing = upgradeItems.find(i => i.templateId === template.id);
      if (existing) {
          setUpgradeItems(upgradeItems.map(i => i.templateId === template.id ? {...i, quantity: i.quantity + 1} : i));
      } else {
          setUpgradeItems([...upgradeItems, { templateId: template.id, quantity: 1, price: template.price }]);
      }
  };

  const handleRemoveUpgradeItem = (templateId: string) => {
      const existing = upgradeItems.find(i => i.templateId === templateId);
      if (existing && existing.quantity > 1) {
          setUpgradeItems(upgradeItems.map(i => i.templateId === templateId ? {...i, quantity: i.quantity - 1} : i));
      } else {
          setUpgradeItems(upgradeItems.filter(i => i.templateId !== templateId));
      }
  };

  // Logica Principal: Migração de Day Use para Hospedagem
  const handleAddRealRoom = () => {
      if (!addRoomModal.reservationId || !selectedRoomToAdd) return;
      const res = reservations.find(r => r.id === addRoomModal.reservationId);
      const room = rooms.find(r => r.id === selectedRoomToAdd);
      
      if (res && room) {
          const additionalCost = upgradeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          const upgradeNote = upgradeItems.map(i => {
              const t = budgetTemplates.find(bt => bt.id === i.templateId);
              return `${i.quantity}x ${t?.name}`;
          }).join(', ');
          
          // Coletar consumo existente de contas virtuais ou barcos (Day Use)
          // para migrar para o quarto real
          const existingConsumption = res.allocatedRooms
            .filter(r => r.roomId.startsWith('virtual-') || r.roomId.startsWith('boat-'))
            .flatMap(r => r.consumption);

          const newAllocatedRoom: AllocatedRoom = {
              roomId: room.id,
              roomNumber: room.number,
              guests: [{ name: res.mainContactName }],
              consumption: existingConsumption // Migra o consumo antigo para cá
          };
          
          // Filtra fora os quartos virtuais/barcos antigos, mantendo apenas quartos reais se houver (provavelmente não há, pois era day use)
          const keepRooms = res.allocatedRooms.filter(r => !r.roomId.startsWith('virtual-') && !r.roomId.startsWith('boat-'));

          const updatedRes = {
              ...res,
              allocatedRooms: [...keepRooms, newAllocatedRoom],
              totalPackageValue: res.totalPackageValue + additionalCost,
              notes: res.notes + (upgradeNote ? ` | Adicionado: ${upgradeNote} (R$ ${additionalCost})` : '')
          };
          updateReservation(updatedRes);
      }
      setAddRoomModal({ open: false, reservationId: null });
      setSelectedRoomToAdd('');
      setUpgradeItems([]);
  };

  const handleCreateBoatConsumption = (reservationId: string, boatId: string, boatName: string) => {
      const res = reservations.find(r => r.id === reservationId);
      if (!res) return;

      const boatRoomId = `boat-${boatId}`;
      
      // Se já existe um "quarto" alocado para este barco, abre ele
      const existing = res.allocatedRooms.find(r => r.roomId === boatRoomId);
      if (existing) {
          setRoomDetailModal({ open: true, reservationId: res.id, roomId: boatRoomId });
          return;
      }

      // Se não, cria um novo "AllocatedRoom" representando o barco para lançar consumo
      const newAllocatedRoom: AllocatedRoom = {
          roomId: boatRoomId,
          roomNumber: `Barco: ${boatName}`,
          guests: [],
          consumption: []
      };

      const updatedRes = {
          ...res,
          allocatedRooms: [...res.allocatedRooms, newAllocatedRoom]
      };
      updateReservation(updatedRes);
      
      setTimeout(() => {
          setRoomDetailModal({ open: true, reservationId: res.id, roomId: boatRoomId });
      }, 100);
  };

  // --- Print Extract Logic ---
  const handlePrintExtract = (res: Reservation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let currentPaidAmount = res.paidAmount;
    // Include unsaved payments if we are in checkout modal
    if (checkoutModal.open && checkoutModal.reservation?.id === res.id) {
        currentPaidAmount += checkoutPaymentsList.reduce((acc, p) => acc + p.amount, 0);
    }
    
    // Combine payments for history
    const allPaymentsHistory = [
        ...(res.payments || []),
        ...(checkoutModal.open && checkoutModal.reservation?.id === res.id ? checkoutPaymentsList : [])
    ];

    const today = new Date().toLocaleDateString('pt-BR');
    const totalConsumption = getTotalConsumption(res);
    const balance = (res.totalPackageValue + totalConsumption) - currentPaidAmount;
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

    const logoHtml = config.logoUrl 
        ? `<img src="${config.logoUrl}" style="height: 80px; width: auto; object-fit: contain;" alt="Logo"/>`
        : `<div class="brand-name" style="font-size: 24px; font-weight: bold; color: #166534;">${config.name}</div>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <title>Extrato de Conta - ${res.mainContactName}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; background: #fff; font-family: 'Open Sans', sans-serif; color: #374151; }
              .page { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; box-sizing: border-box; }
              .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 15px; margin-bottom: 20px; }
              .brand-container { margin-bottom: 10px; }
              .doc-title { font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 700; color: #16a34a; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
              
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12px; }
              .info-item { display: flex; flex-direction: column; }
              .label { font-weight: 700; color: #6b7280; text-transform: uppercase; font-size: 9px; }
              .value { font-weight: 600; color: #111827; }

              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
              th { background: #f0fdf4; color: #166534; padding: 8px; text-align: left; font-weight: 700; border-bottom: 1px solid #16a34a; }
              td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-bold { font-weight: 700; }

              .section-title { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #374151; margin: 15px 0 5px 0; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; display: flex; justify-content: space-between; }

              .totals-box { margin-left: auto; width: 50%; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
              .final-total { border-top: 1px solid #16a34a; margin-top: 5px; padding-top: 5px; font-weight: 800; color: #166534; font-size: 14px; }
          </style>
      </head>
      <body>
          <div class="page">
              <div class="header">
                  <div class="brand-container">${logoHtml}</div>
                  <div style="font-size: 10px; color: #6b7280;">${config.address} | ${config.phone}</div>
              </div>
              
              <div class="doc-title">Extrato de Conta</div>

              <div class="info-grid">
                  <div class="info-item"><span class="label">Hóspede Responsável</span><span class="value">${res.mainContactName}</span></div>
                  <div class="info-item"><span class="label">Período</span><span class="value">${new Date(res.checkInDate).toLocaleDateString('pt-BR')} a ${new Date(res.checkOutDate).toLocaleDateString('pt-BR')}</span></div>
                  <div class="info-item"><span class="label">Emissão</span><span class="value">${today}</span></div>
                  <div class="info-item"><span class="label">Status</span><span class="value">${res.status === 'checked-out' ? 'Finalizado' : 'Em Aberto'}</span></div>
              </div>

              <div class="section-title">
                  <span>Hospedagem & Pacotes</span>
                  <span>R$ ${fmt(res.totalPackageValue)}</span>
              </div>
              <p style="font-size: 10px; color: #666; margin-bottom: 10px;">Valor referente ao pacote contratado (Hospedagem, Barcos, etc).</p>

              <div class="section-title">
                  <span>Detalhamento de Consumo</span>
                  <span>R$ ${fmt(totalConsumption)}</span>
              </div>
              ${res.allocatedRooms.length > 0 ? res.allocatedRooms.map(room => `
                  <div style="margin-bottom: 15px;">
                      <div style="font-weight: 700; font-size: 11px; margin-bottom: 4px; background: #f9fafb; padding: 4px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                          <span>${room.roomId.startsWith('boat-') ? room.roomNumber : (room.roomId.startsWith('virtual') ? 'Conta de Consumo' : `Quarto ${room.roomNumber}`)}</span>
                          <span>Subtotal: R$ ${fmt(getRoomConsumptionTotal(room.consumption))}</span>
                      </div>
                      ${room.consumption.length > 0 ? `
                        <table>
                            <thead><tr><th>Item</th><th class="text-center">Qtd</th><th class="text-right">Total</th></tr></thead>
                            <tbody>
                                ${room.consumption.map(c => `
                                    <tr><td>${c.productName}</td><td class="text-center">${c.quantity}</td><td class="text-right">R$ ${fmt(c.total)}</td></tr>
                                `).join('')}
                            </tbody>
                        </table>
                      ` : '<p style="font-size: 10px; color: #999; padding-left: 5px;">Sem consumo lançado.</p>'}
                  </div>
              `).join('') : '<p style="font-size: 11px; font-style: italic; color: #6b7280;">Nenhum quarto alocado.</p>'}

              <div class="section-title">
                  <span>Histórico de Pagamentos</span>
                  <span>Total Pago: R$ ${fmt(currentPaidAmount)}</span>
              </div>
              ${allPaymentsHistory.length > 0 ? `
                 <table>
                    <thead><tr><th>Data</th><th>Método</th><th>Obs</th><th class="text-right">Valor</th></tr></thead>
                    <tbody>
                        ${allPaymentsHistory.map(p => `
                            <tr>
                                <td>${fmtDate(p.date)}</td>
                                <td>${p.method}</td>
                                <td>${p.notes || '-'}</td>
                                <td class="text-right">R$ ${fmt(p.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                 </table>
              ` : '<p style="font-size: 11px; font-style: italic; color: #6b7280; margin-bottom: 20px;">Nenhum pagamento registrado.</p>'}

              <div class="totals-box">
                  <div class="total-row"><span>Total Pacote:</span><span>R$ ${fmt(res.totalPackageValue)}</span></div>
                  <div class="total-row"><span>Total Consumo:</span><span>R$ ${fmt(totalConsumption)}</span></div>
                  <div class="total-row" style="color: #dc2626;"><span>(-) Total Pago:</span><span>R$ ${fmt(currentPaidAmount)}</span></div>
                  <div class="total-row final-total"><span>Saldo a Pagar:</span><span>R$ ${fmt(balance)}</span></div>
              </div>
              
              <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 10px;">
                  Obrigado pela preferência! Volte sempre.
              </div>
          </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- Manual Check-in Logic ---
  const resetManualCheckin = () => {
      setShowManualCheckin(false);
      setStep(1);
      setManualRes({
          mainContactName: '', contactPhone: '', checkInDate: new Date().toISOString().split('T')[0], checkOutDate: '', totalValue: 0, notes: ''
      });
      setSelectedRooms([]); setSelectedBoats([]); setSelectedGuides([]); setRoomGuests({}); 
      setInitialPaymentInput({ amount: 0, method: 'Pix', notes: '' });
      setManualPaymentsList([]);
  };

  const handleQuickCheckin = (roomId: string) => {
      setStep(1);
      setManualRes({
          mainContactName: '', contactPhone: '', checkInDate: new Date().toISOString().split('T')[0], checkOutDate: '', totalValue: 0, notes: ''
      });
      setSelectedBoats([]); setSelectedGuides([]); setRoomGuests({});
      setInitialPaymentInput({ amount: 0, method: 'Pix', notes: '' });
      setManualPaymentsList([]);
      
      setSelectedRooms([roomId]);
      setShowManualCheckin(true);
  };

  const handleQuickBoatCheckin = (boatId: string) => {
    setStep(1);
    setManualRes({
        mainContactName: '', contactPhone: '', checkInDate: new Date().toISOString().split('T')[0], checkOutDate: '', totalValue: 0, notes: ''
    });
    setSelectedRooms([]); setSelectedGuides([]); setRoomGuests({});
    setInitialPaymentInput({ amount: 0, method: 'Pix', notes: '' });
    setManualPaymentsList([]);

    setSelectedBoats([boatId]);
    setShowManualCheckin(true);
  };

  const addManualPayment = () => {
     if (initialPaymentInput.amount <= 0) return;
     const newPayment: Payment = {
         id: Math.random().toString(36).substr(2, 9),
         amount: initialPaymentInput.amount,
         date: new Date().toISOString(),
         method: initialPaymentInput.method,
         notes: initialPaymentInput.notes || 'Entrada/Sinal'
     };
     setManualPaymentsList([...manualPaymentsList, newPayment]);
     setInitialPaymentInput({ ...initialPaymentInput, amount: 0, notes: '' });
  };

  const removeManualPayment = (id: string) => {
      setManualPaymentsList(manualPaymentsList.filter(p => p.id !== id));
  };

  const handleManualSubmit = () => {
      if (selectedRooms.length === 0 && selectedBoats.length === 0) {
          alert("Selecione ao menos um quarto ou um barco para realizar o check-in.");
          return;
      }

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

      const totalPaid = manualPaymentsList.reduce((acc, p) => acc + p.amount, 0);

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
          paidAmount: totalPaid,
          payments: manualPaymentsList,
          notes: manualRes.notes
      };

      addReservation(newReservation);
      resetManualCheckin();
      alert("Check-in realizado com sucesso!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recepção & Check-out</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie entradas, saídas e consumo.</p>
         </div>
         <div className="flex gap-2">
            <button 
                onClick={() => { resetManualCheckin(); setShowManualCheckin(true); }}
                className="bg-nature-600 hover:bg-nature-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm"
            >
                <PlusCircle size={20} />
                Novo Check-in
            </button>
         </div>
      </div>

      {/* QUICK ACTIONS: AVAILABILITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rooms Availability */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><BedDouble size={18}/> Quartos Livres</h3>
                 <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{availableRooms.length} Disp.</span>
             </div>
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availableRooms.map(room => (
                     <div key={room.id} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-nature-500 dark:hover:border-nature-500 transition-colors bg-gray-50 dark:bg-gray-700/30">
                         <div className="text-sm font-bold text-gray-800 dark:text-white">#{room.number}</div>
                         <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{room.name}</div>
                         <button 
                             onClick={() => handleQuickCheckin(room.id)}
                             className="absolute -top-2 -right-2 bg-nature-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                             title="Check-in Rápido"
                         >
                             <Zap size={12} fill="currentColor" />
                         </button>
                     </div>
                 ))}
                 {availableRooms.length === 0 && <p className="text-xs text-gray-400 col-span-3">Nenhum quarto disponível.</p>}
             </div>
          </div>

          {/* Boats Availability */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Anchor size={18}/> Barcos Livres</h3>
                 <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{availableBoats.length} Disp.</span>
             </div>
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                 {availableBoats.map(boat => (
                     <div key={boat.id} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-700/30">
                         <div className="text-sm font-bold text-gray-800 dark:text-white truncate">#{boat.number}</div>
                         <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{boat.name}</div>
                          <button 
                             onClick={() => handleQuickBoatCheckin(boat.id)}
                             className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                             title="Check-in Embarcado (Day Use)"
                         >
                             <Zap size={12} fill="currentColor" />
                         </button>
                     </div>
                 ))}
                 {availableBoats.length === 0 && <p className="text-xs text-gray-400 col-span-3">Nenhum barco disponível.</p>}
             </div>
          </div>
      </div>

      {/* RESERVATIONS LIST */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
         <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
             <div className="relative w-1/3">
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 <input 
                     placeholder="Buscar hóspede..." 
                     className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                 />
             </div>
             <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                 <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}><Grid size={18}/></button>
                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-400'}`}><List size={18}/></button>
             </div>
         </div>

         <div className="p-4">
             {activeList.length === 0 ? (
                 <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                     <User size={48} className="mx-auto mb-2 opacity-30"/>
                     <p>Nenhum hóspede encontrado.</p>
                 </div>
             ) : (
                 <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                     {activeList.map(res => {
                         const totalConsumption = getTotalConsumption(res);
                         const balance = (res.totalPackageValue + totalConsumption) - res.paidAmount;
                         const hasRealRooms = res.allocatedRooms.some(ar => rooms.find(r => r.id === ar.roomId));
                         const isDayUse = !hasRealRooms && res.boatIds.length > 0;

                         // Map boat IDs to boat objects for displaying consumption buttons in Day Use
                         const resBoats = res.boatIds.map(bid => boats.find(b => b.id === bid)).filter(Boolean);

                         return (
                             <div key={res.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-3">
                                         <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${isDayUse ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-nature-100 text-nature-600 dark:bg-nature-900 dark:text-nature-300'}`}>
                                             {res.mainContactName.charAt(0)}
                                         </div>
                                         <div>
                                             <h4 className="font-bold text-gray-900 dark:text-white">{res.mainContactName}</h4>
                                             <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                                                 res.status === 'confirmed' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 
                                                 (isDayUse ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300')
                                             }`}>
                                                 {res.status === 'confirmed' ? 'Confirmado' : (isDayUse ? 'Embarcado' : 'Hospedado')}
                                             </span>
                                         </div>
                                     </div>
                                     
                                     {res.status === 'checked-in' && (
                                        <div className="flex gap-1">
                                            <button 
                                               onClick={() => handleOpenPartialPayment(res.id)}
                                               className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded"
                                               title="Lançar Pagamento Parcial"
                                            >
                                               <DollarSign size={16} />
                                            </button>
                                            <button 
                                               onClick={() => handlePrintExtract(res)}
                                               className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                               title="Imprimir Extrato"
                                            >
                                               <Printer size={16} />
                                            </button>
                                            <button 
                                               onClick={() => handleStatusChange(res)} 
                                               className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-bold flex items-center gap-1"
                                               title="Realizar Check-out"
                                            >
                                               <LogOut size={14} /> 
                                               <span className="hidden sm:inline">Saída</span>
                                            </button>
                                        </div>
                                     )}
                                     {res.status === 'confirmed' && (
                                         <button onClick={() => handleStatusChange(res)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700">
                                             Check-in
                                         </button>
                                     )}
                                 </div>

                                 <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700/30 p-2 rounded">
                                     <div>
                                         <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px]">Check-in</span>
                                         <span className="text-gray-800 dark:text-gray-200">{new Date(res.checkInDate).toLocaleDateString('pt-BR')}</span>
                                     </div>
                                     <div>
                                         <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px]">Check-out</span>
                                         <span className="text-gray-800 dark:text-gray-200">{res.checkOutDate ? new Date(res.checkOutDate).toLocaleDateString('pt-BR') : '-'}</span>
                                     </div>
                                     <div>
                                         <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px]">Recursos</span>
                                         <span className="text-gray-800 dark:text-gray-200">
                                            {hasRealRooms ? res.allocatedRooms.filter(r => !r.roomId.startsWith('virtual-') && !r.roomId.startsWith('boat-')).map(r => r.roomNumber).join(', ') : 'Day Use (Barcos)'}
                                         </span>
                                     </div>
                                     <div>
                                         <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase text-[9px]">Saldo</span>
                                         <span className={`font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>R$ {balance.toFixed(2)}</span>
                                     </div>
                                 </div>

                                 {res.status === 'checked-in' && (
                                     <div className="space-y-2">
                                         {/* List Allocated Rooms */}
                                         {res.allocatedRooms.filter(r => !r.roomId.startsWith('virtual-') && !r.roomId.startsWith('boat-')).map(room => (
                                             <button 
                                                 key={room.roomId}
                                                 onClick={() => setRoomDetailModal({ open: true, reservationId: res.id, roomId: room.roomId })}
                                                 className="w-full flex justify-between items-center p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <BedDouble size={14} className="text-gray-400"/>
                                                     <span className="font-bold text-gray-700 dark:text-gray-200">
                                                         Quarto {room.roomNumber}
                                                     </span>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <span className="text-gray-500 dark:text-gray-400">
                                                         R$ {getRoomConsumptionTotal(room.consumption).toFixed(2)}
                                                     </span>
                                                     <PlusCircle size={14} className="text-nature-600 dark:text-nature-400"/>
                                                 </div>
                                             </button>
                                         ))}
                                         
                                         {/* List Allocated Boats (For Consumption) */}
                                         {isDayUse && resBoats.map(boat => {
                                             if(!boat) return null;
                                             // Find consumption specifically for this boat if it exists
                                             const boatAllocatedRoom = res.allocatedRooms.find(r => r.roomId === `boat-${boat.id}`);
                                             const boatTotal = boatAllocatedRoom ? getRoomConsumptionTotal(boatAllocatedRoom.consumption) : 0;

                                             return (
                                                 <button 
                                                     key={boat.id}
                                                     onClick={() => handleCreateBoatConsumption(res.id, boat.id, boat.name)}
                                                     className="w-full flex justify-between items-center p-2 border border-dashed border-blue-200 dark:border-blue-900 rounded hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-xs"
                                                 >
                                                     <div className="flex items-center gap-2">
                                                         <Anchor size={14} className="text-blue-400"/>
                                                         <span className="font-bold text-gray-700 dark:text-gray-200">
                                                             Barco: {boat.name}
                                                         </span>
                                                     </div>
                                                     <div className="flex items-center gap-2">
                                                         <span className="text-gray-500 dark:text-gray-400">
                                                             R$ {boatTotal.toFixed(2)}
                                                         </span>
                                                         <PlusCircle size={14} className="text-blue-600 dark:text-blue-400"/>
                                                     </div>
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 )}
                                 
                                 {res.status === 'checked-in' && (
                                     <div className="grid grid-cols-1 mt-2">
                                          <button 
                                              onClick={() => setAddRoomModal({ open: true, reservationId: res.id })}
                                              className="p-2 border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10 rounded text-center text-xs text-blue-600 dark:text-blue-300 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/20 flex items-center justify-center gap-1"
                                          >
                                              <BedDouble size={14}/> + Quarto (Hospedagem)
                                          </button>
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
             )}
         </div>
      </div>

      {/* MODAL: PARTIAL PAYMENT (NEW) */}
      {partialPaymentModal.open && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
                 <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <DollarSign size={20} className="text-blue-600"/> 
                    Lançar Pagamento
                 </h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                     O valor será creditado na conta do hóspede imediatamente.
                 </p>
                 
                 <div className="space-y-3 mb-6">
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valor (R$)</label>
                         <input 
                             type="number" 
                             autoFocus
                             className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                             value={partialPayment.amount}
                             onChange={e => setPartialPayment({...partialPayment, amount: parseFloat(e.target.value) || 0})}
                         />
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Forma de Pagamento</label>
                         <select 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={partialPayment.method}
                            onChange={e => setPartialPayment({...partialPayment, method: e.target.value})}
                         >
                            <option value="Pix">Pix</option>
                            <option value="Dinheiro">Dinheiro</option>
                            <option value="Cartão Crédito">Cartão Crédito</option>
                            <option value="Cartão Débito">Cartão Débito</option>
                            <option value="Transferência">Transferência</option>
                         </select>
                     </div>
                     <div>
                         <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Observação</label>
                         <input 
                             className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                             placeholder="Ex: Parcial das bebidas"
                             value={partialPayment.notes}
                             onChange={e => setPartialPayment({...partialPayment, notes: e.target.value})}
                         />
                     </div>
                 </div>

                 <div className="flex justify-end gap-2">
                     <button onClick={() => setPartialPaymentModal({open: false, reservationId: null})} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                     <button onClick={handleSavePartialPayment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Confirmar</button>
                 </div>
             </div>
         </div>
      )}

      {/* MODAL: CONSUMPTION */}
      {roomDetailModal.open && activeRes && activeRoom && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                 <div className="bg-nature-600 p-4 flex justify-between items-center text-white">
                     <div>
                         <h3 className="font-bold text-lg">
                             {activeRoom.roomId.startsWith('boat-') ? activeRoom.roomNumber : (activeRoom.roomId.startsWith('virtual') ? 'Conta de Consumo' : `Quarto ${activeRoom.roomNumber}`)}
                         </h3>
                         <p className="text-sm text-nature-100">{activeRes.mainContactName}</p>
                     </div>
                     <button onClick={() => setRoomDetailModal({ open: false, reservationId: null, roomId: null })}><X size={24}/></button>
                 </div>
                 
                 <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                     <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Lançar Novo Item</label>
                     <div className="flex gap-2">
                         <div className="flex-1">
                             <select 
                                 className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                 value={selectedProduct}
                                 onChange={e => setSelectedProduct(e.target.value)}
                             >
                                 <option value="">Selecione o produto...</option>
                                 {products.map(p => (
                                     <option key={p.id} value={p.id}>{p.name} - R$ {p.price.toFixed(2)}</option>
                                 ))}
                             </select>
                         </div>
                         <input 
                             type="number" 
                             min="1" 
                             className="w-16 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                             value={qtyInput}
                             onChange={e => setQtyInput(parseInt(e.target.value))}
                         />
                         <button 
                             onClick={handleAddConsumption}
                             disabled={!selectedProduct}
                             className="bg-nature-600 text-white px-3 rounded hover:bg-nature-700 disabled:opacity-50"
                         >
                             <Plus size={20}/>
                         </button>
                     </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-4">
                     <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3 text-sm flex items-center gap-2"><List size={16}/> Extrato de Consumo</h4>
                     {activeRoom.consumption.length === 0 ? (
                         <p className="text-sm text-gray-400 italic text-center py-4">Nenhum consumo lançado.</p>
                     ) : (
                         <table className="w-full text-sm">
                             <thead className="text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                                 <tr>
                                     <th className="text-left py-2">Item</th>
                                     <th className="text-center py-2">Qtd</th>
                                     <th className="text-right py-2">Total</th>
                                     <th className="py-2"></th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {activeRoom.consumption.map(item => (
                                     <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                                         <td className="py-2 text-gray-800 dark:text-gray-200">{item.productName}</td>
                                         <td className="py-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                                         <td className="py-2 text-right font-medium text-gray-900 dark:text-white">R$ {item.total.toFixed(2)}</td>
                                         <td className="py-2 text-right">
                                             <button onClick={() => handleRemoveConsumption(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     )}
                 </div>
                 
                 <div className="p-4 bg-gray-100 dark:bg-gray-900 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                     <span className="font-bold text-gray-600 dark:text-gray-400">Total Consumo:</span>
                     <span className="font-bold text-xl text-nature-700 dark:text-nature-400">R$ {getRoomConsumptionTotal(activeRoom.consumption).toFixed(2)}</span>
                 </div>
             </div>
         </div>
      )}

      {/* MODAL: ADD ROOM */}
      {addRoomModal.open && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
                 <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                    <BedDouble size={20} className="text-nature-600"/> 
                    Adicionar Quarto
                 </h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                     Ao adicionar um quarto, todas as despesas de Day Use (Barcos) serão transferidas para ele.
                 </p>
                 
                 <div className="flex-1 overflow-y-auto pr-2">
                     <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Quarto Disponível</label>
                        <select 
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            value={selectedRoomToAdd}
                            onChange={e => setSelectedRoomToAdd(e.target.value)}
                        >
                            <option value="">Selecione o quarto...</option>
                            {availableRooms.map(r => (
                                <option key={r.id} value={r.id}>Quarto {r.number} - {r.name}</option>
                            ))}
                        </select>
                     </div>

                     <div className="mb-4">
                         <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex justify-between">
                             <span>Itens de Hospedagem / Diárias</span>
                             <span className="text-nature-600">+ R$ {upgradeItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                         </label>
                         
                         <div className="space-y-2">
                             {budgetTemplates.map(template => {
                                 const selected = upgradeItems.find(i => i.templateId === template.id);
                                 return (
                                     <div key={template.id} className={`flex justify-between items-center p-2 rounded border ${selected ? 'border-nature-500 bg-nature-50 dark:bg-nature-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                         <div>
                                             <div className="text-sm font-medium dark:text-white">{template.name}</div>
                                             <div className="text-xs text-gray-500">R$ {template.price.toFixed(2)}</div>
                                         </div>
                                         <div className="flex items-center gap-2">
                                             {selected ? (
                                                 <>
                                                     <button onClick={() => handleRemoveUpgradeItem(template.id)} className="p-1 rounded bg-white dark:bg-gray-800 border dark:border-gray-600 text-red-500 hover:bg-gray-100"><MinusCircle size={16}/></button>
                                                     <span className="text-sm font-bold w-4 text-center dark:text-white">{selected.quantity}</span>
                                                     <button onClick={() => handleAddUpgradeItem(template)} className="p-1 rounded bg-white dark:bg-gray-800 border dark:border-gray-600 text-green-500 hover:bg-gray-100"><PlusCircle size={16}/></button>
                                                 </>
                                             ) : (
                                                 <button onClick={() => handleAddUpgradeItem(template)} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300">Adicionar</button>
                                             )}
                                         </div>
                                     </div>
                                 );
                             })}
                             {budgetTemplates.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum template de orçamento cadastrado.</p>}
                         </div>
                     </div>
                 </div>

                 <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700 mt-2">
                     <button onClick={() => {setAddRoomModal({open: false, reservationId: null}); setUpgradeItems([]);}} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg">Cancelar</button>
                     <button onClick={handleAddRealRoom} disabled={!selectedRoomToAdd} className="px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 font-bold disabled:opacity-50">Confirmar</button>
                 </div>
             </div>
         </div>
      )}

      {/* MODAL: CHECKOUT */}
      {checkoutModal.open && checkoutModal.reservation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-red-50 dark:bg-red-900/20 rounded-t-xl">
                      <div>
                          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                              <LogOut size={24}/> Fechamento de Conta
                          </h3>
                          <p className="text-red-600 dark:text-red-300 text-sm">{checkoutModal.reservation.mainContactName}</p>
                      </div>
                      <button onClick={() => setCheckoutModal({open: false, reservation: null})} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Financial Summary */}
                      <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">Resumo Financeiro</h4>
                          <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Pacote Hospedagem:</span>
                                  <span className="font-medium dark:text-gray-200">R$ {checkoutModal.reservation.totalPackageValue.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Consumo Total:</span>
                                  <span className="font-medium dark:text-gray-200">R$ {getTotalConsumption(checkoutModal.reservation).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Já Pago:</span>
                                  <span className="font-medium text-green-600">(-) R$ {checkoutModal.reservation.paidAmount.toFixed(2)}</span>
                              </div>
                              
                              {/* New Payments in list */}
                              {checkoutPaymentsList.length > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-blue-600 dark:text-blue-400">Novos Pagamentos (Lista):</span>
                                  <span className="font-medium text-blue-600 dark:text-blue-400">(-) R$ {checkoutPaymentsList.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}</span>
                                </div>
                              )}

                              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 text-lg">
                                  <span className="font-bold text-gray-800 dark:text-white">Saldo Devedor:</span>
                                  <span className="font-bold text-red-600">
                                      R$ {(
                                          (checkoutModal.reservation.totalPackageValue + getTotalConsumption(checkoutModal.reservation)) 
                                          - checkoutModal.reservation.paidAmount 
                                          - checkoutPaymentsList.reduce((acc, p) => acc + p.amount, 0)
                                      ).toFixed(2)}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Payment Entry Section */}
                      <div>
                          <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2"><DollarSign size={18}/> Adicionar Pagamentos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Valor</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        value={checkoutPayment.amount}
                                        onChange={e => setCheckoutPayment({...checkoutPayment, amount: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Método</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        value={checkoutPayment.method}
                                        onChange={e => setCheckoutPayment({...checkoutPayment, method: e.target.value})}
                                    >
                                        <option value="Pix">Pix</option>
                                        <option value="Cartão Crédito">Cartão Crédito</option>
                                        <option value="Cartão Débito">Cartão Débito</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Obs</label>
                                    <input 
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                        value={checkoutPayment.notes}
                                        onChange={e => setCheckoutPayment({...checkoutPayment, notes: e.target.value})}
                                        placeholder="Opcional"
                                    />
                                </div>
                                <button 
                                    onClick={addCheckoutPayment}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center gap-2 h-[38px]"
                                >
                                    <Plus size={18}/> Lançar
                                </button>
                          </div>

                          {/* List of new payments */}
                          {checkoutPaymentsList.length > 0 && (
                            <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Valor</th>
                                            <th className="px-3 py-2 text-left">Método</th>
                                            <th className="px-3 py-2 text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                        {checkoutPaymentsList.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-3 py-2">R$ {p.amount.toFixed(2)}</td>
                                                <td className="px-3 py-2">{p.method}</td>
                                                <td className="px-3 py-2 text-right">
                                                    <button onClick={() => removeCheckoutPayment(p.id)} className="text-red-500"><Trash2 size={14}/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                          )}
                      </div>
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex justify-end gap-3">
                      <button 
                        onClick={() => setCheckoutModal({open: false, reservation: null})}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white dark:hover:bg-gray-700"
                      >
                          Fechar
                      </button>
                      <button 
                        onClick={processCheckout}
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-sm"
                      >
                          <CheckCircle size={18} /> Confirmar & Finalizar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* CHECK-IN WIZARD MODAL */}
      {showManualCheckin && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-colors border border-gray-200 dark:border-gray-700">
                {/* Wizard Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-emerald-600 rounded-t-xl text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Check-in Manual</h3>
                        <p className="text-emerald-100 text-sm">Passo {step} de 4</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* STEP 1: Resources & Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">1. Dados e Recursos</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nome Responsável</label>
                                    <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={manualRes.mainContactName} onChange={e => setManualRes({...manualRes, mainContactName: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Check-in</label>
                                        <input type="date" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={manualRes.checkInDate} onChange={e => setManualRes({...manualRes, checkInDate: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Check-out</label>
                                        <input type="date" className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white" value={manualRes.checkOutDate} onChange={e => setManualRes({...manualRes, checkOutDate: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            
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
                        </div>
                    )}

                    {/* STEP 2: Guests */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">2. Hóspedes</h4>
                            <div className="space-y-4">
                                {selectedRooms.length > 0 ? selectedRooms.map(roomId => {
                                    const room = rooms.find(r => r.id === roomId);
                                    const guests = roomGuests[roomId] || [];
                                    const addGuest = () => setRoomGuests({...roomGuests, [roomId]: [...guests, {name: '', phone: ''}]});
                                    const updateGuest = (idx: number, field: string, val: string) => {
                                        const newGuests = [...guests];
                                        newGuests[idx] = {...newGuests[idx], [field]: val};
                                        setRoomGuests({...roomGuests, [roomId]: newGuests});
                                    };

                                    return (
                                        <div key={roomId} className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="font-bold dark:text-white">Quarto {room?.number}</h5>
                                                <button onClick={addGuest} className="text-xs bg-white dark:bg-gray-700 border px-2 py-1 rounded flex items-center gap-1"><Plus size={12}/> Add Hóspede</button>
                                            </div>
                                            {guests.map((g, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <input placeholder="Nome" className="flex-1 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={g.name} onChange={e => updateGuest(idx, 'name', e.target.value)} />
                                                    <input placeholder="Tel" className="w-1/3 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={g.phone} onChange={e => updateGuest(idx, 'phone', e.target.value)} />
                                                </div>
                                            ))}
                                            {guests.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum hóspede listado.</p>}
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
                                        <p>Check-in apenas de barcos (Day Use).</p>
                                        <p className="text-sm">O responsável será listado no barco.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Financial (Partial Payments) */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">3. Financeiro Inicial</h4>
                            
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Valor Total do Pacote (R$)</label>
                                <input 
                                    type="number" 
                                    className="w-full text-xl font-bold p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                                    value={manualRes.totalValue}
                                    onChange={e => setManualRes({...manualRes, totalValue: parseFloat(e.target.value) || 0})}
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><DollarSign size={16}/> Pagamentos de Entrada / Sinal</h5>
                                
                                <div className="grid grid-cols-4 gap-2 mb-4 items-end">
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500">Valor</label>
                                        <input type="number" className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={initialPaymentInput.amount} onChange={e => setInitialPaymentInput({...initialPaymentInput, amount: parseFloat(e.target.value)||0})} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500">Método</label>
                                        <select className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={initialPaymentInput.method} onChange={e => setInitialPaymentInput({...initialPaymentInput, method: e.target.value})}>
                                            <option value="Pix">Pix</option>
                                            <option value="Cartão">Cartão</option>
                                            <option value="Dinheiro">Dinheiro</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs text-gray-500">Obs</label>
                                        <input className="w-full p-2 border rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white" value={initialPaymentInput.notes} onChange={e => setInitialPaymentInput({...initialPaymentInput, notes: e.target.value})} />
                                    </div>
                                    <button onClick={addManualPayment} className="bg-nature-600 text-white p-2 rounded hover:bg-nature-700 h-[38px] flex items-center justify-center"><Plus size={18}/></button>
                                </div>

                                {manualPaymentsList.length > 0 && (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                                            <tr><th className="text-left p-2">Valor</th><th className="text-left p-2">Método</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {manualPaymentsList.map(p => (
                                                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                                                    <td className="p-2">R$ {p.amount.toFixed(2)}</td>
                                                    <td className="p-2">{p.method}</td>
                                                    <td className="p-2 text-right"><button onClick={() => removeManualPayment(p.id)} className="text-red-500"><Trash2 size={14}/></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold border-t dark:border-gray-600">
                                                <td className="p-2 text-green-600">Total Pago: R$ {manualPaymentsList.reduce((acc,p)=>acc+p.amount,0).toFixed(2)}</td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Confirmation */}
                    {step === 4 && (
                        <div className="space-y-6 text-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                                <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400"/>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Confirmar Check-in?</h2>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-left max-w-md mx-auto space-y-2 text-sm border dark:border-gray-700">
                                <div className="flex justify-between"><span>Responsável:</span> <strong>{manualRes.mainContactName}</strong></div>
                                <div className="flex justify-between"><span>Período:</span> <strong>{new Date(manualRes.checkInDate).toLocaleDateString('pt-BR')} até {manualRes.checkOutDate ? new Date(manualRes.checkOutDate).toLocaleDateString('pt-BR') : '?'}</strong></div>
                                <div className="flex justify-between"><span>Recursos:</span> <strong>{selectedRooms.length} Quartos, {selectedBoats.length} Barcos</strong></div>
                                <div className="flex justify-between border-t pt-2 mt-2"><span>Total Pacote:</span> <strong>R$ {manualRes.totalValue.toFixed(2)}</strong></div>
                                <div className="flex justify-between text-green-600 font-bold"><span>Total Pago (Entrada):</span> <strong>R$ {manualPaymentsList.reduce((acc,p)=>acc+p.amount,0).toFixed(2)}</strong></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wizard Footer */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-6 py-2 border rounded-lg hover:bg-white dark:hover:bg-gray-700 dark:border-gray-600 dark:text-white">Voltar</button>
                    ) : (
                        <button onClick={resetManualCheckin} className="px-6 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Cancelar</button>
                    )}

                    {step < 4 ? (
                        <button onClick={() => {
                            if (step === 1 && !manualRes.mainContactName) return alert("Informe o nome do responsável.");
                            setStep(step + 1);
                        }} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                            Próximo <ArrowRight size={16}/>
                        </button>
                    ) : (
                        <button onClick={handleManualSubmit} className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                            <CheckCircle size={18}/> Finalizar
                        </button>
                    )}
                </div>
             </div>
          </div>
      )}

      <style>{`
         .label { display: block; font-size: 0.75rem; font-weight: 700; color: #4b5563; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.025em; }
         .dark .label { color: #9ca3af; }
      `}</style>
    </div>
  );
};

export default FrontDesk;
