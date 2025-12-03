
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Fish, 
  ConciergeBell, 
  Settings, 
  Menu, 
  X,
  Anchor,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label, active, onClick, isExternal }: any) => {
  if (isExternal) {
      const fullLink = `${window.location.href.split('#')[0]}#${to}`;
      return (
        <a
            href={fullLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-nature-300 hover:bg-nature-800 hover:text-white border border-dashed border-nature-700 mt-4"
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </a>
      )
  }
  return (
    <Link 
        to={to} 
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active 
            ? 'bg-nature-700 text-white shadow-md' 
            : 'text-nature-100 hover:bg-nature-800 hover:text-white dark:text-gray-400 dark:hover:bg-nature-900 dark:hover:text-white'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, theme, toggleTheme } = useApp();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/crm', icon: Users, label: 'CRM / Vendas' },
    { to: '/checkin', icon: ConciergeBell, label: 'Check-in & Consumo' },
    { to: '/recursos', icon: Fish, label: 'Cadastros e Recursos' },
    { to: '/config', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-nature-900 dark:bg-black text-white z-50 flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center space-x-2">
          <Anchor className="text-nature-300" />
          <span className="font-bold text-lg truncate max-w-[200px]">{config.name}</span>
        </div>
        <button onClick={toggleSidebar}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 z-40 w-64 bg-nature-900 dark:bg-black text-white transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col shadow-xl border-r border-nature-800 dark:border-gray-800`}
      >
        <div className="p-6 flex flex-col items-center border-b border-nature-800 dark:border-gray-800">
          <div className="h-16 w-16 bg-nature-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-nature-800 dark:text-nature-400 mb-3 shadow-inner overflow-hidden">
             {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-full w-full object-cover" />
             ) : (
                <Anchor size={32} />
             )}
          </div>
          <h1 className="text-xl font-bold text-center leading-tight truncate w-full">{config.name}</h1>
          <p className="text-xs text-nature-300 mt-1 uppercase tracking-wide">
             Gestão do Negócio
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}

          {user?.role === 'platform_admin' && (
             <NavItem 
                to="/super-admin"
                icon={ShieldCheck}
                label="Painel Super Admin"
                active={location.pathname === '/super-admin'}
                onClick={() => setIsSidebarOpen(false)}
             />
          )}
        </nav>

        {/* User & Theme Footer */}
        <div className="p-4 bg-nature-950 dark:bg-gray-900 bg-opacity-30 border-t border-nature-800 dark:border-gray-800 space-y-4">
           
           {user && (
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <div className="h-8 w-8 rounded-full bg-nature-700 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className="text-[10px] text-nature-400 uppercase">{user.role === 'platform_admin' ? 'Admin' : 'Gestor'}</span>
                    </div>
                 </div>
                 <button onClick={logout} className="text-nature-400 hover:text-red-400" title="Sair">
                    <LogOut size={18} />
                 </button>
              </div>
           )}

           <div className="flex items-center justify-between px-1 pt-2 border-t border-nature-800 dark:border-gray-700">
             <span className="text-xs font-medium text-nature-300">Tema</span>
             <button 
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-nature-800 dark:bg-gray-800 text-nature-200 hover:text-white transition-colors"
             >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
