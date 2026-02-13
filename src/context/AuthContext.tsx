import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import CONFIG from '../config';

const API_URL = CONFIG.BASE_URL;

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
    updateProfile: (data: Partial<User>) => Promise<boolean>;
    googleLogin: (googleToken: string) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

interface SignupData {
    name: string;
    email?: string;
    username?: string;
    phone?: string;
    password: string;
    // Profile Fields
    isStudent?: boolean;
    university?: string;
    address?: string;
    town?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
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
        loadStoredUser();
    }, []);

    const loadStoredUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Verify user existence with backend
                try {
                    const response = await fetch(`${API_URL}/users/${parsedUser.id}`);
                    if (!response.ok) {
                        // If user not found (e.g. DB reset) or other error, clear session
                        console.warn('User validation failed, logging out locally.');
                        await logout();
                    } else {
                        // Optional: Update local user with fresh data from server
                        const data = await response.json();
                        if (data) {
                            setUser(data);
                            await AsyncStorage.setItem('user', JSON.stringify(data));
                        }
                    }
                } catch (verifyError) {
                    // Network error during verification - keep local session but warn
                    console.warn('Could not verify user session with server:', verifyError);
                }
            }
        } catch (error) {
            console.error('Failed to load stored user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            setUser(data.user);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || 'Signup failed' };
            }

            setUser(result.user);
            await AsyncStorage.setItem('user', JSON.stringify(result.user));
            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const updateProfile = async (data: Partial<User>): Promise<boolean> => {
        if (!user?.id) return false;
        try {
            const response = await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                setUser(result.user);
                await AsyncStorage.setItem('user', JSON.stringify(result.user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Update profile error:', error);
            return false;
        }
    };

    const googleLogin = async (googleToken: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: googleToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Google login failed' };
            }

            setUser(data.user);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            return { success: true };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Request failed' };
            }
            return { success: true };
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Reset failed' };
            }
            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    const logout = async (): Promise<void> => {
        setUser(null);
        await AsyncStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                updateProfile,
                googleLogin,
                forgotPassword,
                resetPassword,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
