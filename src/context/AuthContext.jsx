/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session
    useEffect(() => {
        const storedAuth = localStorage.getItem('nb_auth');
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                setUser(parsed.user);
                setIsAuthenticated(true);
            } catch {
                localStorage.removeItem('nb_auth');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            // 1. Check Admin Hardcoded
            if (email === 'newbalanmedicals@gmail.com' && password === 'Newbalan@2026') {
                const adminUser = {
                    id: 'admin-001',
                    name: 'Admin',
                    email,
                    role: 'admin',
                    permissions: ['dashboard', 'doctors', 'medicines', 'orders', 'appointments', 'delivery', 'coupons', 'staff']
                };
                setUser(adminUser);
                setIsAuthenticated(true);
                localStorage.setItem('nb_auth', JSON.stringify({ user: adminUser, token: 'admin-token' }));
                return { success: true, role: 'admin' };
            }

            // 2. Check Managers from localStorage (via DataContext logic)
            const savedManagers = JSON.parse(localStorage.getItem('nb_managers') || '[]');
            const manager = savedManagers.find(m => m.email === email && m.password === password);
            if (manager) {
                const managerUser = { ...manager, role: 'manager' };
                setUser(managerUser);
                setIsAuthenticated(true);
                localStorage.setItem('nb_auth', JSON.stringify({ user: managerUser, token: 'manager-token-' + manager.id }));
                return { success: true, role: 'manager' };
            }

            // 3. Check Customer via API
            const response = await api.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            localStorage.setItem('nb_auth', JSON.stringify({ user: response.user, token: response.token }));
            return { success: true, role: 'customer' };

        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await api.register(userData);
            setUser(response.user);
            setIsAuthenticated(true);
            localStorage.setItem('nb_auth', JSON.stringify({ user: response.user, token: response.token }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (updates) => {
        if (!user) return { success: false, message: 'Not logged in' };
        setIsLoading(true);
        try {
            let updatedUser;

            // Special handling for Admin (Local only)
            if (user.role === 'admin') {
                updatedUser = { ...user, ...updates };
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                updatedUser = await api.updateProfile(user.id, updates);
                if (!updatedUser) throw new Error('Failed to update user on server');
            }

            const newUserState = { ...user, ...updatedUser };
            setUser(newUserState);
            const stored = JSON.parse(localStorage.getItem('nb_auth') || '{}');
            localStorage.setItem('nb_auth', JSON.stringify({ ...stored, user: newUserState }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('nb_auth');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
