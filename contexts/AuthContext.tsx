import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true, 
  isAdmin: false,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (role: UserRole) => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let newUser: User;
    if (role === UserRole.OWNER) {
      newUser = { id: 'owner-123', name: 'Rajesh Owner', phone: '9999999999', role };
    } else {
      // Log in as an existing tenant added by the owner
      const storedTenants = localStorage.getItem('tenants');
      const tenantsList: User[] = storedTenants ? JSON.parse(storedTenants) : [];
      if (tenantsList.length > 0) {
        const first = tenantsList[0];
        newUser = { id: first.id, name: first.name, phone: first.phone, role: UserRole.TENANT };
      } else {
        newUser = { id: 'tenant-demo', name: 'Demo Tenant', phone: '9999999999', role };
      }
    }

    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    loading,
    isAdmin: currentUser?.role === UserRole.OWNER,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
