import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  language: string;
  state?: string;
  target_role?: string;
  current_level: string;
  completed_credits: number;
  total_credits: number;
  streak: number;
  profile_picture?: string;
  learning_goals: string[];
  skills: string[];
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  loginWithOTP: (phone: string, otp: string, name: string, role?: string) => Promise<User>;
  sendOTP: (phone: string) => Promise<{ message: string; otp?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const storedUser = apiService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          // Refresh user data from server
          await refreshUser();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      apiService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(email, password);
      setUser(response.user);
      return response.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      setUser(response.user);
      return response.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    return await apiService.sendOTP(phone);
  };

  const loginWithOTP = async (phone: string, otp: string, name: string, role: string = 'learner') => {
    try {
      setIsLoading(true);
      const response = await apiService.verifyOTP(phone, otp, name, role);
      setUser(response.user);
      return response.user;
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const user = await apiService.getCurrentUser();
        setUser(user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      apiService.clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithOTP,
        sendOTP,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};