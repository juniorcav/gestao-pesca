
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
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        // 1. Check if Supabase is configured and reachable
        if (isSupabaseConfigured()) {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            if (session?.user) {
                await fetchProfile(session.user);
                return;
            }
        }
        
        // 2. Fallback: Check for Local Demo Session
        const demoUser = localStorage.getItem('demo_user_session');
        if (demoUser) {
            setUser(JSON.parse(demoUser));
        }

      } catch (err) {
        console.warn("Auth check failed, falling back to offline/demo mode:", err);
        // Try local storage even if Supabase check failed (e.g. network error)
        const demoUser = localStorage.getItem('demo_user_session');
        if (demoUser) setUser(JSON.parse(demoUser));
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes only if configured
    if (isSupabaseConfigured()) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
             await fetchProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
             setUser(null);
             localStorage.removeItem('demo_user_session'); // Clear demo session too
             setLoading(false);
          } else if (!session) {
             // Only clear if we don't have a demo session active
             if (!localStorage.getItem('demo_user_session')) {
                 setUser(null);
             }
             setLoading(false);
          }
        });
        return () => {
          subscription.unsubscribe();
        };
    }
  }, []);

  // Helper with retry logic to handle race conditions between Auth and DB Trigger
  const fetchProfile = async (authUser: any, retries = 3) => {
      try {
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        // Retry logic if profile not found immediately (Trigger lag)
        if (!data && retries > 0) {
            console.log(`Profile not found, retrying... (${retries} left)`);
            await new Promise(res => setTimeout(res, 1000));
            return fetchProfile(authUser, retries - 1);
        }

        if (data) {
          const mappedUser: User = {
            id: data.id,
            name: data.name || authUser.user_metadata?.name || 'Usuário',
            email: data.email || authUser.email,
            role: (data.role as UserRole) || authUser.user_metadata?.role || 'angler',
            avatarUrl: data.avatar_url,
            businessId: data.business_id
          };
          setUser(mappedUser);
        } else {
            // Fallback: If DB fetch fails entirely, use Auth Metadata
            console.warn("Could not fetch profile from DB. Using Auth Metadata.");
            const fallbackUser: User = {
                id: authUser.id,
                name: authUser.user_metadata?.name || 'Usuário',
                email: authUser.email,
                role: authUser.user_metadata?.role || 'angler',
                avatarUrl: authUser.user_metadata?.avatar_url
            };
            setUser(fallbackUser);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return { success: true };

    } catch (err: any) {
        const msg = (err.message || '').toLowerCase();
        
        // Fallback to Demo Login if Failed to Fetch (Network/Config error)
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('configured') || msg === 'load failed') {
            console.warn("Network/Config error. Logging in as Demo User.");
            const demoUser: User = {
                id: 'demo-user-123',
                name: 'Usuário Demo (Offline)',
                email: email,
                role: 'business', // Default to business for demo
                avatarUrl: ''
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

  const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<AuthResponse> => {
     setLoading(true);
     try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
               data: {
                  name: name,
                  role: role
               }
            }
        });

        if (error) throw error;
        return { success: true };

     } catch (err: any) {
        const msg = (err.message || '').toLowerCase();

        // Fallback to Demo Signup
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('configured') || msg === 'load failed') {
            console.warn("Network/Config error. Creating Demo User.");
            const demoUser: User = {
                id: 'demo-user-' + Math.random().toString(36).substr(2,9),
                name: name,
                email: email,
                role: role,
                avatarUrl: ''
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
                redirectTo: window.location.origin
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
