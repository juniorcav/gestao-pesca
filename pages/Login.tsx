
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Anchor, Mail, Lock, Chrome, Briefcase, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { login, loginWithGoogle, signUp, loading, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<UserRole>('business');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');

  // Pre-fill for Admin Tab
  const switchToAdmin = () => {
      setActiveTab('platform_admin');
      setMode('login');
      setEmail('master@pescagestor.com');
      setPassword('master123'); // Convenience for demo
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let result;

    if (mode === 'login') {
        result = await login(email, password);
        if (result.success) {
            // Navigation handled by App.tsx useEffect based on user state change
            // But checking special case for Master Admin immediate redirect
            if (email === 'master@pescagestor.com') {
                navigate('/super-admin');
            } else {
                navigate('/');
            }
        } else {
             // Handle Error Display
             let msg = result.error || 'Erro desconhecido.';
             if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
             setError(msg);
        }
    } else {
        // SIGNUP FLOW
        result = await signUp(email, password, name, activeTab, businessName);
        if (result.success) {
            alert("Cadastro realizado com sucesso! Faça login para acessar.");
            setMode('login'); // Switch back to login mode
            setPassword(''); // Clear password for security
        } else {
             let msg = result.error || 'Erro desconhecido.';
             if (msg.includes('User already registered')) msg = 'Este e-mail já está cadastrado.';
             if (msg.includes('Password should be')) msg = 'A senha deve ter pelo menos 6 caracteres.';
             setError(msg);
        }
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle(activeTab);
    if (!result.success) {
        setError(result.error || 'Erro no login com Google.');
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-nature-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920" 
          alt="Fishing Boat" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div>
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Anchor className="text-white" />
               </div>
               <span className="font-bold text-xl tracking-wide uppercase">PescaGestor Pro</span>
            </div>
          </div>
          <div className="max-w-md">
             <h1 className="text-4xl font-bold mb-4 leading-tight">Plataforma Multi-Negócios</h1>
             <p className="text-nature-100 text-lg">
                Gerencie sua pousada, hotel ou operação de pesca em uma única plataforma SaaS.
             </p>
          </div>
          <div className="text-sm text-nature-300">© 2024 PescaGestor.</div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-800 relative transition-colors">
         <div className="w-full max-w-md space-y-8">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}</h2>
               <p className="mt-2 text-gray-500 dark:text-gray-400">{mode === 'login' ? 'Bem-vindo de volta.' : 'Cadastre sua empresa hoje.'}</p>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
               <button 
                  type="button"
                  onClick={() => { setActiveTab('business'); setEmail(''); setPassword(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'business' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
               >
                  Sou Empresa
               </button>
               <button 
                  type="button"
                  onClick={() => { setActiveTab('angler'); setEmail(''); setPassword(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'angler' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
               >
                  Sou Pescador
               </button>
               <button 
                  type="button"
                  onClick={switchToAdmin}
                  className={`flex-0 px-3 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'platform_admin' ? 'bg-nature-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-nature-600'}`}
                  title="Acesso Super Admin"
               >
                  <ShieldCheck size={18} />
               </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
               {mode === 'signup' && activeTab !== 'platform_admin' && (
                  <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                        <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      
                      {activeTab === 'business' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa / Pousada</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input type="text" required placeholder="Ex: Pousada do Rio" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                            </div>
                          </div>
                      )}
                  </>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input type="email" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input type="password" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
               </div>

               {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-center">
                     {error}
                  </div>
               )}

               <button type="submit" disabled={loading} className="w-full bg-nature-600 text-white font-bold py-3 rounded-lg hover:bg-nature-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  {loading ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div> : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
               </button>
            </form>

            {activeTab !== 'platform_admin' && (
                <button onClick={handleGoogleLogin} type="button" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <Chrome size={20} /> Entrar com Google
                </button>
            )}
            
            {activeTab !== 'platform_admin' && (
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mode === 'login' ? 'Novo por aqui?' : 'Já tem conta?'}
                        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="ml-1 text-nature-600 dark:text-nature-400 font-bold hover:underline">
                            {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                        </button>
                    </p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Login;
