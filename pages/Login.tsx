
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../types';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Anchor, Mail, Lock, Chrome, Briefcase, ShieldCheck, ArrowLeft, UserCheck } from 'lucide-react';

const Login = () => {
  const { login, loginWithGoogle, signUp, loading, user } = useAuth();
  const { platformSettings } = useApp(); // Use global branding
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<UserRole>('business');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('interno.icatd@gmail.com');
  const [password, setPassword] = useState('jr041070');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');

  // Invite state
  const [isInviteFlow, setIsInviteFlow] = useState(false);
  const [inviteBusinessId, setInviteBusinessId] = useState('');
  const [inviteBusinessName, setInviteBusinessName] = useState('');

  // Branding
  const appName = platformSettings?.appName || "PescaGestor Pro";
  const logoUrl = platformSettings?.logoUrl;

  useEffect(() => {
    // Parse query params for invite
    const params = new URLSearchParams(location.search);
    const invite = params.get('invite');
    if (invite === 'true') {
        setIsInviteFlow(true);
        setMode('signup');
        setActiveTab('business');
        
        const inviteEmail = params.get('email');
        const inviteName = params.get('name');
        const bid = params.get('bid');
        const bname = params.get('bname');

        if (inviteEmail) setEmail(inviteEmail);
        if (inviteName) setName(inviteName);
        if (bid) setInviteBusinessId(bid);
        if (bname) setInviteBusinessName(bname);
        
        setPassword(''); // Clear default dev password
    }
  }, [location]);

  const switchToAdmin = () => {
      setActiveTab('platform_admin');
      setMode('login');
      setEmail('master@pescagestor.com');
      setPassword('master123'); 
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Security check for Admin Signup
    if (activeTab === 'platform_admin' && mode === 'signup' && adminCode !== 'ADMIN_SECRET_2024') {
        setError("Código de segurança inválido.");
        return;
    }

    let result;

    if (mode === 'login') {
        result = await login(email, password);
        if (result.success) {
            if (email === 'master@pescagestor.com' || activeTab === 'platform_admin') {
                navigate('/super-admin');
            } else {
                navigate('/dashboard');
            }
        } else {
             let msg = result.error || 'Erro desconhecido.';
             if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
             setError(msg);
        }
    } else {
        // Pass invite business ID if available
        result = await signUp(email, password, name, activeTab, businessName, inviteBusinessId);
        if (result.success) {
            alert("Cadastro realizado com sucesso! Faça login para acessar.");
            if (isInviteFlow) {
                // Auto login or redirect to login form pre-filled
                setIsInviteFlow(false);
            }
            setMode('login');
            // Retain email for ease of login
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
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Left Side (Image) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-nature-900 shrink-0 h-screen sticky top-0">
        {/* Desktop Back Button */}
        <div className="absolute top-6 left-6 z-20">
           <Link to="/landing" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
               <ArrowLeft size={18} /> 
               <span className="text-sm">Voltar ao Início</span>
           </Link>
        </div>

        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920" 
          alt="Background" 
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-nature-950/90 via-nature-900/60 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white h-full">
          <div>
            <div className="flex items-center gap-3 mt-12">
               <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                  {logoUrl ? <img src={logoUrl} className="h-full w-full object-contain"/> : <Anchor className="text-white" />}
               </div>
               <span className="font-bold text-xl tracking-wide uppercase shadow-sm">{appName}</span>
            </div>
          </div>
          <div className="max-w-md mb-12">
             <h1 className="text-4xl font-bold mb-4 leading-tight drop-shadow-md">Plataforma Multi-Negócios</h1>
             <p className="text-nature-100 text-lg drop-shadow-sm">
                Gerencie sua pousada, hotel ou operação de pesca em uma única plataforma SaaS completa e intuitiva.
             </p>
          </div>
          <div className="text-sm text-nature-300">© 2024 {appName}. Todos os direitos reservados.</div>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-800 relative transition-colors min-h-screen">
         {/* Mobile Back Button */}
         <div className="lg:hidden absolute top-4 left-4 z-20">
            <Link to="/landing" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-nature-600 transition-colors font-medium">
                <ArrowLeft size={20} /> 
                <span className="text-sm">Voltar</span>
            </Link>
         </div>

         <div className="w-full max-w-md space-y-8 my-auto">
            <div className="text-center lg:text-left">
               {isInviteFlow ? (
                   <div className="bg-nature-50 dark:bg-nature-900/30 p-4 rounded-xl border border-nature-100 dark:border-nature-800 mb-6">
                       <UserCheck className="text-nature-600 dark:text-nature-400 mb-2 h-8 w-8" />
                       <h2 className="text-2xl font-bold text-nature-800 dark:text-nature-200">Convite para Equipe</h2>
                       <p className="text-sm text-nature-700 dark:text-nature-300 mt-1">
                           Você foi convidado para colaborar em <strong>{inviteBusinessName || 'Uma Empresa'}</strong>. 
                           Confirme seus dados e crie uma senha abaixo.
                       </p>
                   </div>
               ) : (
                   <>
                       <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}</h2>
                       <p className="mt-2 text-gray-500 dark:text-gray-400">{mode === 'login' ? 'Bem-vindo de volta.' : 'Cadastre sua empresa hoje.'}</p>
                   </>
               )}
            </div>

            {/* Role Tabs - Hide if in Invite Flow */}
            {!isInviteFlow && (
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button 
                    type="button"
                    onClick={() => { setActiveTab('business'); setEmail('interno.icatd@gmail.com'); setPassword('jr041070'); }}
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
            )}

            <form onSubmit={handleAuth} className="space-y-6">
               {mode === 'signup' && (
                  <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                        <input type="text" required readOnly={isInviteFlow} className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none ${isInviteFlow ? 'opacity-70 cursor-not-allowed' : ''}`} value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      
                      {activeTab === 'business' && !isInviteFlow && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Empresa</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input type="text" required placeholder="Ex: Pousada do Rio" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                            </div>
                          </div>
                      )}

                      {activeTab === 'platform_admin' && (
                          <div>
                            <label className="block text-sm font-medium text-red-600 mb-1">Chave de Segurança</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-red-400" size={18} />
                                <input type="password" required placeholder="Código secreto" className="w-full pl-10 pr-4 py-2.5 bg-red-50 border border-red-300 rounded-lg text-red-900 outline-none" value={adminCode} onChange={e => setAdminCode(e.target.value)} />
                            </div>
                          </div>
                      )}
                  </>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input type="email" required readOnly={isInviteFlow} className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none ${isInviteFlow ? 'opacity-70 cursor-not-allowed' : ''}`} value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isInviteFlow ? 'Crie sua Senha' : 'Senha'}</label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input type="password" required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder={isInviteFlow ? "Mínimo 6 caracteres" : ""} />
                  </div>
               </div>

               {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-center">
                     {error}
                  </div>
               )}

               <button type="submit" disabled={loading} className="w-full bg-nature-600 text-white font-bold py-3 rounded-lg hover:bg-nature-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                  {loading ? <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div> : (isInviteFlow ? 'Aceitar Convite e Entrar' : (mode === 'login' ? 'Entrar' : 'Cadastrar'))}
               </button>
            </form>

            {activeTab !== 'platform_admin' && !isInviteFlow && (
                <button onClick={handleGoogleLogin} type="button" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                    <Chrome size={20} /> Entrar com Google
                </button>
            )}
            
            {/* Toggle Mode */}
            {!isInviteFlow && (
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mode === 'login' ? 'Novo por aqui?' : 'Já tem conta?'}
                        <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="ml-1 text-nature-600 dark:text-nature-400 font-bold hover:underline">
                            {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                        </button>
                    </p>
                </div>
            )}
            {isInviteFlow && (
                <div className="text-center mt-6">
                    <Link to="/login" onClick={() => setIsInviteFlow(false)} className="text-sm text-gray-500 hover:underline">Cancelar convite e voltar ao login</Link>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Login;
