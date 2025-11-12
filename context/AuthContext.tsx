'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
user: User | null;
loading: boolean;
login: (email: string, password: string) => Promise<void>;
logout: () => Promise<void>;
isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
    checkAuth();
}, []);

const checkAuth = async () => {
    try {
    const token = localStorage.getItem('token');
    if (token) {
        // Get user from backend
        const userData = await authAPI.me();
        setUser(userData as User);
    }
    } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    } finally {
    setLoading(false);
    }
};

const login = async (email: string, password: string) => {
    try {
      // Response dari backend: { token, user }
    const response = await authAPI.login(email, password);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user as User);
    
    router.push('/dashboard');
    } catch (error: unknown) {
    console.error('Login error:', error);
    throw new Error(error instanceof Error ? error.message : 'Login failed');
    
    }
};

    const logout = async () => {
    try {
        await authAPI.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    }
};

const isAdmin = user?.role === 'admin';

    return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
    }
return context;
}