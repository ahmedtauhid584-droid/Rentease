import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (userId: string) => Promise<void>;
  register: (data: { name: string; phone: string; email: string; role: UserRole }) => Promise<User>;
  logout: () => void;
  accounts: User[];
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAdmin: false,
  login: async () => { },
  register: async () => ({ id: '', name: '', phone: '', role: UserRole.TENANT }),
  logout: () => { },
  accounts: []
});

export const useAuth = () => useContext(AuthContext);

// Generate unique ID: RE-OWN-XXXX or RE-TEN-XXXX
const generateUserId = (role: UserRole): string => {
  const prefix = role === UserRole.OWNER ? 'RE-OWN' : 'RE-TEN';
  const num = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${prefix}-${num}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<User[]>(() => {
    const stored = localStorage.getItem('rentease_accounts');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Save accounts to localStorage
  useEffect(() => {
    localStorage.setItem('rentease_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const register = async (data: { name: string; phone: string; email: string; role: UserRole }): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Make sure ID is unique
    let userId = generateUserId(data.role);
    while (accounts.find(a => a.id === userId)) {
      userId = generateUserId(data.role);
    }

    const newUser: User = {
      id: userId,
      name: data.name,
      phone: data.phone,
      role: data.role,
    };

    setAccounts(prev => [...prev, newUser]);

    // Also add to tenants list if tenant (so owner can see them)
    if (data.role === UserRole.TENANT) {
      const storedTenants = localStorage.getItem('tenants');
      const tenantsList = storedTenants ? JSON.parse(storedTenants) : [];
      tenantsList.push(newUser);
      localStorage.setItem('tenants', JSON.stringify(tenantsList));
    }

    return newUser;
  };

  const login = async (userId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const input = userId.trim();
    const account = accounts.find(a => a.id === input || a.phone === input);
    if (!account) {
      setLoading(false);
      throw new Error('Account not found. Please check your User ID or Phone Number.');
    }

    setCurrentUser(account);
    localStorage.setItem('currentUser', JSON.stringify(account));
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
    register,
    logout,
    accounts
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
