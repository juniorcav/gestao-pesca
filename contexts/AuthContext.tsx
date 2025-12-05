import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, UserRole } from '../types';

interface AuthResponse {
    success: boolean;
    error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (role?: UserRole) => Promise<AuthResponse>;
  signUp: (email: string, password: string, name: string, role: UserRole, businessName?: string, businessId?: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from 'profiles' table after Auth
  const fetchProfile = async (authUserId: string, email: string) => {
      try {
          const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUserId)
              .single();

          if (error) throw error;

          if (data) {
              const loadedUser: User = {
                  id: data.id,
                  email: data.email || email,
                  name: data.name || email.split('@')[0],
                  role: data.role as UserRole,
                  businessId: data.business_id, // Important for Multi-tenancy
                  avatarUrl: data.avatar_url
              };
              setUser(loadedUser);
          }
      } catch (error) {
          console.error("Error fetching profile:", error);
          // Fallback if profile doesn't exist yet (shouldn't happen with correct Triggers)
          setUser({
              id: authUserId,
              email: email,
              name: email.split('@')[0],
              role: 'business' // Default fallback
          });
      }
  };

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email!);
        }
        setLoading(false);
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            await fetchProfile(session.user.id, session.user.email!);
        } else {
            setUser(null);
        }
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        setLoading(false);
        return { success: false, error: error.message };
    }

    // Profile fetch is handled by onAuthStateChange
    return { success: true };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, businessName?: string, businessId?: string): Promise<AuthResponse> => {
     setLoading(true);
     
     // Pass metadata so the SQL Trigger can populate the profiles/businesses tables
     const { data, error } = await supabase.auth.signUp({
         email,
         password,
         options: {
             data: {
                 name,
                 role,
                 business_name: businessName,
                 business_id: businessId // Pass existing business ID if invite
             }
         }
     });

     if (error) {
         setLoading(false);
         return { success: false, error: error.message };
     }

     setLoading(false);
     return { success: true };
  };

  const loginWithGoogle = async (role: UserRole = 'business'): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // We can't easily pass custom metadata in OAuth flow start without extra config,
            // relying on user to update profile later or default trigger logic.
            redirectTo: window.location.origin
        }
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
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