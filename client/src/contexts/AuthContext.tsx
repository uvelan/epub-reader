import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            checkAuth();
        }
    }, [token]);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/check-auth', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data.user);
            return true;
        } catch (error) {
            logout();
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};