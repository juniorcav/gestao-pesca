import React from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  DollarSign, Users, BedDouble, AlertTriangle, TrendingUp, ExternalLink 
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start justify-between transition-colors">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { reservations, rooms, deals } = useApp();

  // Generate public link based on current location
  const publicLink = `${window.location.href.split('#')[0]}#/landing`;

  // Calculate Metrics
  const activeReservations = reservations.filter(r => r.status === 'checked-in');
  const upcomingReservations = reservations.filter(r => new Date(r.checkInDate) >= new Date() && r.status === 'confirmed');
  
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRooms / rooms.length) * 100) || 0;

  // Calculate revenue: Package Values + Consumption
  const revenueCurrentMonth = reservations
    .filter(r => new Date(r.checkInDate).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => {
        // Sum consumption across all rooms
        const consumptionTotal = curr.allocatedRooms.reduce((rAcc, room) => {
            return rAcc + room.consumption.reduce((cAcc, item) => cAcc + item.total, 0);
        }, 0);
        return acc + curr.totalPackageValue + consumptionTotal;
    }, 0);

  const potentialRevenue = deals
    .filter(d => d.stage === 'new' || d.stage === 'waiting' || d.stage === 'reservation')
    .reduce((acc, curr) => acc + curr.value, 0);

  // Mock data for chart
  const data = [
    { name: 'Seg', ocupacao: 40 },
    { name: 'Ter', ocupacao: 35 },
    { name: 'Qua', ocupacao: 50 },
    { name: 'Qui', ocupacao: 75 },
    { name: 'Sex', ocupacao: 90 },
    { name: 'Sab', ocupacao: 95 },
    { name: 'Dom', ocupacao: 60 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral</h2>
           <span className="text-sm text-gray-500 dark:text-gray-400">Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
        </div>
        
        <a 
            href={publicLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
            <ExternalLink size={16} className="text-nature-600 dark:text-nature-400" />
            Ver Site Público
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ocupação Atual" 
          value={`${occupancyRate}%`} 
          icon={BedDouble} 
          color="bg-blue-500" 
          subtext={`${occupiedRooms} de ${rooms.length} quartos ocupados`}
        />
        <StatCard 
          title="Reservas Ativas" 
          value={activeReservations.length} 
          icon={Users} 
          color="bg-emerald-500"
          subtext="Grupos hospedados"
        />
        <StatCard 
          title="Receita (Mês)" 
          value={`R$ ${revenueCurrentMonth.toLocaleString('pt-BR')}`} 
          icon={DollarSign} 
          color="bg-nature-600"
          subtext="Reservas + Consumo"
        />
        <StatCard 
          title="Pipeline Vendas" 
          value={`R$ ${potentialRevenue.toLocaleString('pt-BR')}`} 
          icon={TrendingUp} 
          color="bg-amber-500"
          subtext="Em negociação"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ocupação Semanal Prevista</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#1f2937',
                      color: '#f3f4f6'
                  }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Bar dataKey="ocupacao" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.ocupacao > 80 ? '#16a34a' : '#0ea5e9'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Alertas e Avisos</h3>
          <div className="space-y-4">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.slice(0, 3).map(res => (
                <div key={res.id} className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <div className="mt-1 mr-3 text-blue-500 dark:text-blue-400">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Check-in Pendente</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {res.mainContactName} - Chega em {new Date(res.checkInDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
               <p className="text-sm text-gray-500 dark:text-gray-400">Sem check-ins próximos.</p>
            )}

            {/* Mock Stock Alert */}
            <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50">
              <div className="mt-1 mr-3 text-red-500 dark:text-red-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">Estoque Baixo</p>
                <p className="text-xs text-red-700 dark:text-red-300">Gasolina abaixo de 100L. Verificar reposição.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;