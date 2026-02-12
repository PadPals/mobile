import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onSignupPress: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onSignupPress }) => {
    const { login, googleLogin } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!identifier.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await login(identifier.trim(), password);

        setIsLoading(false);

        if (result.success) {
            onClose();
            setIdentifier('');
            setPassword('');
        } else {
            setError(result.error || 'Login failed');
        }
    };

    const handleGoogleLogin = async () => {
        // In production, this would trigger Google sign-in flow
        // For now, we'll show a placeholder message
        setError('Google OAuth - Add credentials to enable');
    };

    const handleSignup = () => {
        onClose();
        onSignupPress();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="bg-rose-50 rounded-t-[32px] p-6 pb-10">
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-black text-rose-950 tracking-tight">
                                    Welcome Back
                                </Text>
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="w-10 h-10 bg-white/60 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={20} color="#9ca3af" />
                                </TouchableOpacity>
                            </View>

                            {/* Error Message */}
                            {error ? (
                                <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-4">
                                    <Text className="text-red-600 text-sm text-center">{error}</Text>
                                </View>
                            ) : null}

                            {/* Login Form */}
                            <View className="gap-4 mb-6">
                                <View>
                                    <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                        Username, Email, or Phone
                                    </Text>
                                    <TextInput
                                        value={identifier}
                                        onChangeText={setIdentifier}
                                        placeholder="Enter your username, email, or phone"
                                        autoCapitalize="none"
                                        className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                        placeholderTextColor="#d1d5db"
                                    />
                                </View>

                                <View>
                                    <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                        Password
                                    </Text>
                                    <View className="relative">
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="Enter your password"
                                            secureTextEntry={!showPassword}
                                            className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 pr-12 text-rose-950 font-medium"
                                            placeholderTextColor="#d1d5db"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-4"
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off' : 'eye'}
                                                size={20}
                                                color="#9ca3af"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                className="bg-rose-500 py-4 rounded-2xl items-center mb-4 shadow-lg shadow-rose-200"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-sm uppercase tracking-widest">
                                        Sign In
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View className="flex-row items-center mb-4">
                                <View className="flex-1 h-px bg-rose-200" />
                                <Text className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    or
                                </Text>
                                <View className="flex-1 h-px bg-rose-200" />
                            </View>

                            {/* Google Login */}
                            <TouchableOpacity
                                onPress={handleGoogleLogin}
                                className="bg-white border border-gray-200 py-4 rounded-2xl flex-row items-center justify-center mb-6"
                            >
                                <Ionicons name="logo-google" size={20} color="#4285F4" />
                                <Text className="ml-2 font-bold text-gray-700">
                                    Continue with Google
                                </Text>
                            </TouchableOpacity>

                            {/* Signup Link */}
                            <View className="flex-row justify-center">
                                <Text className="text-gray-500">Don't have an account? </Text>
                                <TouchableOpacity onPress={handleSignup}>
                                    <Text className="text-rose-500 font-bold">Sign up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default LoginModal;
