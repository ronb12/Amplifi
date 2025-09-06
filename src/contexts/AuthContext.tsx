import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  channelId?: string;
  isCreator: boolean;
  subscriberCount: number;
  joinDate: string;
  description: string;
  location: string;
  website?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  becomeCreator: () => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  email: string;
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, validate token with backend
          const mockUser: User = {
            id: 'user_1',
            email: 'user@example.com',
            username: 'demo_user',
            displayName: 'Demo User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
            isCreator: false,
            subscriberCount: 0,
            joinDate: '2024-01-01',
            description: 'Welcome to my channel!',
            location: 'United States',
            socialLinks: {}
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@example.com' && password === 'demo123') {
        const mockUser: User = {
          id: 'user_1',
          email: 'demo@example.com',
          username: 'demo_user',
          displayName: 'Demo User',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          isCreator: false,
          subscriberCount: 0,
          joinDate: '2024-01-01',
          description: 'Welcome to my channel!',
          location: 'United States',
          socialLinks: {}
        };
        setUser(mockUser);
        localStorage.setItem('authToken', 'mock_token');
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        isCreator: false,
        subscriberCount: 0,
        joinDate: new Date().toISOString().split('T')[0],
        description: 'Welcome to my channel!',
        location: 'United States',
        socialLinks: {}
      };

      setUser(newUser);
      localStorage.setItem('authToken', 'mock_token');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) return { success: false, error: 'Not authenticated' };
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  };

  const becomeCreator = async () => {
    try {
      if (!user) return { success: false, error: 'Not authenticated' };
      
      const updatedUser = { 
        ...user, 
        isCreator: true,
        channelId: `channel_${Date.now()}`,
        description: user.description || 'Welcome to my channel!'
      };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to become creator' };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    becomeCreator
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
