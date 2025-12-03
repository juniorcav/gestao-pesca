
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  signUp: (email: string, password: string, name: string, role: UserRole, businessName?: string) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_EMAIL = 'master@pescagestor.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from local storage on mount
    const savedUser = localStorage.getItem('pescagestor_user');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (e) {
            console.error("Error parsing user from local storage");
            localStorage.removeItem('pescagestor_user');
        }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple Mock Login Logic
    let loggedUser: User;

    if (email === MASTER_EMAIL && password === 'master123') {
        loggedUser = {
           id: 'master-admin',
           name: 'Master Admin',
           email: email,
           role: 'platform_admin',
           businessId: 'platform'
       };
    } else {
        // Accept any login for demo purposes if valid email format
        if (!email.includes('@')) {
            setLoading(false);
            return { success: false, error: 'E-mail inválido.' };
        }
        
        loggedUser = {
            id: 'local-user-' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            role: 'business',
            businessId: 'local-business'
        };
    }

    setUser(loggedUser);
    localStorage.setItem('pescagestor_user', JSON.stringify(loggedUser));
    setLoading(false);
    return { success: true };
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole, businessName?: string): Promise<AuthResponse> => {
     setLoading(true);
     await new Promise(resolve => setTimeout(resolve, 500));

     const newUser: User = {
        id: 'local-user-' + Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        role: role,
        businessId: 'local-business-' + Math.random().toString(36).substr(2, 9)
     };

     // Note: In a real local app, we might check if user exists in a local array of users.
     // For this version, we just log them in immediately.
     
     setUser(newUser);
     localStorage.setItem('pescagestor_user', JSON.stringify(newUser));
     
     // Also save initial business config locally if provided
     if (role === 'business' && businessName) {
        // We can trigger this in AppContext via effects, or just let the default config take over
     }

     setLoading(false);
     return { success: true };
  };

  const loginWithGoogle = async (role: UserRole = 'business'): Promise<AuthResponse> => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const googleUser: User = {
        id: 'google-user-' + Math.random().toString(36).substr(2, 9),
        name: 'Usuário Google',
        email: 'usuario@gmail.com',
        role: role,
        businessId: 'local-business-google'
    };
    
    setUser(googleUser);
    localStorage.setItem('pescagestor_user', JSON.stringify(googleUser));
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('pescagestor_user');
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
