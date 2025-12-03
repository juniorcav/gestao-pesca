
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
    let mounted = true;

    const initializeAuth = async () => {
        try {
            // 1. Create a promise for the actual session check
            const sessionCheckPromise = async () => {
                // Fallback: Check for Local Demo Session first for speed
                const demoUser = localStorage.getItem('demo_user_session');
                if (demoUser) {
                    if (mounted) setUser(JSON.parse(demoUser));
                    return;
                }

                // Check Supabase
                if (isSupabaseConfigured()) {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    
                    if (session?.user && mounted) {
                        await fetchProfile(session.user);
                    }
                }
            };

            // 2. Create a timeout promise (max 2.5 seconds waiting for Supabase)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Auth Check Timeout")), 2500)
            );

            // 3. Race them. If Supabase is slow, we stop waiting and show the login screen.
            await Promise.race([sessionCheckPromise(), timeoutPromise]);

        } catch (err) {
            console.warn("Auth initialization finished with warning (or timeout):", err);
            // If it timed out, we just let the user see the login screen.
            // Any background success from Supabase will eventually update via onAuthStateChange
        } finally {
            if (mounted) setLoading(false);
        }
    };

    initializeAuth();

    // Listen for auth changes only if configured
    if (isSupabaseConfigured()) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' && session?.user) {
             // Don't set loading true here to avoid UI flicker, just fetch background
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

  // Helper with retry logic to handle race conditions between Auth and DB Trigger
  const fetchProfile = async (authUser: any, retries = 2) => {
      try {
        // Fast path: use metadata immediately while fetching DB
        const fallbackUser: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Usuário',
            email: authUser.email,
            role: (authUser.user_metadata?.role as UserRole) || 'angler',
            avatarUrl: authUser.user_metadata?.avatar_url
        };

        // Attempt DB Fetch
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        // Retry logic if profile not found immediately (Trigger lag)
        if (!data && retries > 0) {
            // Short delay
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
            businessId: data.business_id
          };
          setUser(mappedUser);
        } else {
            // Fallback: If DB fetch fails entirely, use Auth Metadata
            // This ensures the user can still login even if the 'profiles' table is missing/erroring
            setUser(fallbackUser);
        }
      } catch (error) {
        console.error("Error fetching profile, using fallback:", error);
        // Ensure we at least set the user from the auth token
        setUser({
            id: authUser.id,
            name: authUser.user_metadata?.name || 'Usuário',
            email: authUser.email,
            role: authUser.user_metadata?.role || 'angler',
            avatarUrl: authUser.user_metadata?.avatar_url
        });
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
