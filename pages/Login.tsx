import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Anchor, Mail, Lock, LogIn, Chrome, ArrowLeft, UserPlus } from 'lucide-react';

const Login = () => {
  const { login, loginWithGoogle, signUp, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<UserRole>('business');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let result;

    if (mode === 'login') {
        result = await login(email, password);
    } else {
        result = await signUp(email, password, name, activeTab);
        if (result.success) {
            alert("Cadastro realizado! Se o Supabase estiver configurado corretamente, verifique seu e-mail. Se estiver em modo Demo, você já pode entrar.");
            setMode('login');
            // If in demo mode, auto-fill for convenience
            if (!result.error) {
               setPassword('');
            }
            return;
        }
    }

    if (result.success) {
      navigate('/');
    } else {
      // Translate common Supabase errors
      let msg = result.error || 'Erro desconhecido.';
      if (msg.includes('Invalid login credentials')) msg = 'E-mail ou senha incorretos.';
      if (msg.includes('Email not confirmed')) msg = 'E-mail não confirmado. Verifique sua caixa de entrada.';
      if (msg.includes('User already registered')) msg = 'Este e-mail já está cadastrado.';
      if (msg.includes('Password should be')) msg = 'A senha deve ter pelo menos 6 caracteres.';
      if (msg.includes('Failed to fetch')) msg = 'Falha de conexão com o servidor. Entrando em Modo Offline/Demo.';
      
      setError(msg);
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
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-nature-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1920" 
          alt="Fishing Boat" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div>
            <Link to="/landing" className="flex items-center gap-2 text-nature-300 hover:text-white transition-colors mb-8 text-sm font-medium">
               <ArrowLeft size={16} /> Voltar ao Site
            </Link>
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Anchor className="text-white" />
               </div>
               <span className="font-bold text-xl tracking-wide uppercase">PescaGestor Pro</span>
            </div>
          </div>
          
          <div className="max-w-md">
             <h1 className="text-4xl font-bold mb-4 leading-tight">Gerencie sua Pousada com Eficiência</h1>
             <p className="text-nature-100 text-lg">
                Do check-in à gestão de barcos e guias. Tudo que você precisa para oferecer a melhor experiência de pesca.
             </p>
          </div>

          <div className="text-sm text-nature-300">
             © 2024 PescaGestor. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-800 relative transition-colors">
         <div className="lg:hidden absolute top-4 left-4">
             <Link to="/landing" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium">
                <ArrowLeft size={16} /> Site
             </Link>
         </div>

         <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
               <div className="lg:hidden flex justify-center mb-4">
                  <div className="h-12 w-12 bg-nature-600 rounded-lg flex items-center justify-center">
                    <Anchor className="text-white" size={24} />
                  </div>
               </div>
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
               <p className="mt-2 text-gray-500 dark:text-gray-400">{mode === 'login' ? 'Acesse sua conta para continuar.' : 'Comece a gerenciar seu negócio hoje.'}</p>
            </div>

            {/* Role Selector */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
               <button 
                  type="button"
                  onClick={() => setActiveTab('business')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'business' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                  Sou Negócio
               </button>
               <button 
                  type="button"
                  onClick={() => setActiveTab('angler')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'angler' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                  Sou Pescador
               </button>
               <button 
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'admin' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
               >
                  Admin
               </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
               {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                    <input 
                        type="text"
                        required
                        placeholder="Seu nome"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nature-500 focus:border-transparent transition-all"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                  </div>
               )}

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input 
                        type="email"
                        required
                        placeholder={activeTab === 'business' ? 'pousada@exemplo.com' : 'usuario@exemplo.com'}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nature-500 focus:border-transparent transition-all"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                     <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-nature-500 focus:border-transparent transition-all"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                     />
                  </div>
                  {mode === 'login' && (
                    <div className="flex justify-end mt-1">
                        <span className="text-xs text-nature-600 dark:text-nature-400 hover:text-nature-700 cursor-pointer">Esqueceu a senha?</span>
                    </div>
                  )}
               </div>

               {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100 dark:border-red-900/50 text-center">
                     {error}
                  </div>
               )}

               <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-nature-600 text-white font-bold py-3 rounded-lg hover:bg-nature-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
               >
                  {loading ? (
                     <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                     <>
                        {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                        {mode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta'}
                     </>
                  )}
               </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Ou continue com</span></div>
            </div>

            <button 
                onClick={handleGoogleLogin}
                type="button"
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
                <Chrome size={20} className="text-gray-600 dark:text-gray-400" />
                Google
            </button>
            
            <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button 
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError('');
                        }}
                        className="ml-1 text-nature-600 dark:text-nature-400 font-bold hover:underline"
                    >
                        {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
                    </button>
                </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;