
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AuthResponse {
    success: boolean;
    error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (role?: UserRole) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name: string, role: UserRole, businessName?: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MASTER CREDENTIALS (BACKDOOR FOR SAAS MANAGEMENT)
const MASTER_EMAIL = 'master@pescagestor.com';
const MASTER_PASS = 'master123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
        try {
            const sessionCheckPromise = async () => {
                const demoUser = localStorage.getItem('demo_user_session');
                if (demoUser) {
                    if (mounted) setUser(JSON.parse(demoUser));
                    return;
                }

                if (isSupabaseConfigured()) {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    
                    if (session?.user && mounted) {
                        await fetchProfile(session.user);
                    }
                }
            };

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Auth Check Timeout")), 2500)
            );

            await Promise.race([sessionCheckPromise(), timeoutPromise]);

        } catch (err) {
            console.warn("Auth initialization finished with warning (or timeout):", err);
        } finally {
            if (mounted) setLoading(false);
        }
    };

    initializeAuth();

    if (isSupabaseConfigured()) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
             await fetchProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
             setUser(null);
             localStorage.removeItem('demo_user_session'); 
             setLoading(false);
          } else if (!session) {
             if (!localStorage.getItem('demo_user_session')) {
                 setUser(null);
             }
             setLoading(false);
          }
        });
        return () => {
          subscription.unsubscribe();
          mounted = false;
        };
    } else {
        return () => { mounted = false; };
    }
  }, []);

  const fetchProfile = async (authUser: any, retries = 2) => {
      try {
        const fallbackUser: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Usuário',
            email: authUser.email,
            role: (authUser.user_metadata?.role as UserRole) || 'angler',
            avatarUrl: authUser.user_metadata?.avatar_url,
            businessId: authUser.user_metadata?.business_id
        };

        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (!data && retries > 0) {
            await new Promise(res => setTimeout(res, 500));
            return fetchProfile(authUser, retries - 1);
        }

        if (data) {
          const mappedUser: User = {
            id: data.id,
            name: data.name || fallbackUser.name,
            email: data.email || fallbackUser.email,
            role: (data.role as UserRole) || fallbackUser.role,
            avatarUrl: data.avatar_url,
            businessId: data.business_id // Crucial for multi-tenancy
          };
          setUser(mappedUser);
        } else {
            setUser(fallbackUser);
        }
      } catch (error) {
        console.error("Error fetching profile, using fallback:", error);
        setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Usuário',
            email: authUser.email,
            role: authUser.user_metadata?.role || 'angler',
            avatarUrl: authUser.user_metadata?.avatar_url,
            businessId: authUser.user_metadata?.business_id
        });
      }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
        // MASTER USER CHECK (Priority)
        if (email === MASTER_EMAIL && password === MASTER_PASS) {
             const adminUser: User = {
                id: 'master-admin',
                name: 'Master Admin',
                email: email,
                role: 'platform_admin',
                avatarUrl: '',
                businessId: 'platform'
            };
            setUser(adminUser);
            localStorage.setItem('demo_user_session', JSON.stringify(adminUser));
            setLoading(false);
            return { success: true };
        }

        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return { success: true };

    } catch (err: any) {
        const msg = (err.message || '').toLowerCase();
        
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('configured') || msg === 'load failed') {
            console.warn("Network/Config error. Logging in as Demo User.");
            // Determine role based on what user was trying to access or fallback
            const demoUser: User = {
                id: 'demo-user-123',
                name: 'Usuário Demo (Offline)',
                email: email,
                role: 'business',
                avatarUrl: '',
                businessId: 'demo-business-id'
            };
            setUser(demoUser);
            localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
            setLoading(false);
            return { success: true };
        }

        console.error("Login error:", err.message);
        setLoading(false);
        return { success: false, error: err.message };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, businessName?: string): Promise<AuthResponse> => {
     setLoading(true);
     try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

        // Generate a business ID if creating a business account
        const newBusinessId = role === 'business' ? Math.random().toString(36).substr(2, 9) : undefined;

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: {
                  name: name,
                  role: role,
                  business_id: newBusinessId, // Link user to new business
                  business_name: businessName // Passed to DB trigger to create table entry
               }
            }
        });

        if (error) throw error;
        return { success: true };

     } catch (err: any) {
        const msg = (err.message || '').toLowerCase();

        if (msg.includes('fetch') || msg.includes('network') || msg.includes('configured') || msg === 'load failed') {
            console.warn("Network/Config error. Creating Demo User.");
            const demoBusinessId = 'demo-business-' + Math.random().toString(36).substr(2,9);
            const demoUser: User = {
                id: 'demo-user-' + Math.random().toString(36).substr(2,9),
                name: name,
                email: email,
                role: role,
                avatarUrl: '',
                businessId: role === 'business' ? demoBusinessId : undefined
            };
            setUser(demoUser);
            localStorage.setItem('demo_user_session', JSON.stringify(demoUser));
            setLoading(false);
            return { success: true };
        }

        console.error("Signup error:", err.message);
        setLoading(false);
        return { success: false, error: err.message };
     }
  };

  const loginWithGoogle = async (role: UserRole = 'angler'): Promise<AuthResponse> => {
    setLoading(true);
    try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                redirectTo: window.location.origin,
            }
        });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message || 'Erro ao conectar com Google (verifique config).' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
        try {
            await supabase.auth.signOut();
        } catch (e) { console.warn("SignOut error", e); }
    }
    localStorage.removeItem('demo_user_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      signUp,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
