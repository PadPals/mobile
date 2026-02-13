import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SOUTH_AFRICAN_TOWNS, SOUTH_AFRICAN_UNIVERSITIES, PAD_SIZES } from '../constants';

const SignupScreen = () => {
    const navigation = useNavigation();
    const { signup } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // New Fields
    const [isStudent, setIsStudent] = useState(true);
    const [university, setUniversity] = useState('');
    const [address, setAddress] = useState('');
    const [town, setTown] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Selection Modal State
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionTitle, setSelectionTitle] = useState('');
    const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
    const [onSelectOption, setOnSelectOption] = useState<(option: string) => void>(() => { });

    const openSelection = (title: string, options: string[], onSelect: (opt: string) => void) => {
        setSelectionTitle(title);
        setSelectionOptions(options);
        setOnSelectOption(() => onSelect);
        setSelectionModalVisible(true);
    };

    const handleOptionSelect = (option: string) => {
        onSelectOption(option);
        setSelectionModalVisible(false);
    };

    const handleSignup = async () => {
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        if (!email.trim() && !username.trim() && !phone.trim()) {
            setError('At least one of email, username, or phone is required');
            return;
        }

        if (!password.trim()) {
            setError('Password is required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!town) {
            setError('Town is required');
            return;
        }

        if (isStudent && !university) {
            setError('University is required for Student Pals');
            return;
        }

        if (!isStudent && !address) {
            setError('Address is required for Everyday Pals');
            return;
        }

        setIsLoading(true);
        setError('');

        const result = await signup({
            name: name.trim(),
            email: email.trim() || undefined,
            username: username.trim() || undefined,
            phone: phone.trim() || undefined,
            password,
            // New Fields
            isStudent,
            university: isStudent ? university : undefined,
            address: !isStudent ? address : undefined,
            town,
        });

        setIsLoading(false);

        if (result.success) {
            navigation.goBack();
        } else {
            setError(result.error || 'Signup failed');
        }
    };

    const handleGoogleSignup = () => {
        setError('Google OAuth - Add credentials to enable');
    };

    return (
        <SafeAreaView className="flex-1 bg-rose-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="px-6 pt-8 pb-12">
                        {/* Header */}
                        <View className="flex-row items-center mb-8">
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                className="w-10 h-10 bg-white/60 rounded-full items-center justify-center mr-4"
                            >
                                <Ionicons name="arrow-back" size={20} color="#9ca3af" />
                            </TouchableOpacity>
                            <Text className="text-3xl font-black text-rose-950 tracking-tight">
                                Create Account
                            </Text>
                        </View>

                        {/* Error Message */}
                        {error ? (
                            <View className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-6">
                                <Text className="text-red-600 text-sm text-center">{error}</Text>
                            </View>
                        ) : null}

                        {/* Form */}
                        <View className="gap-4 mb-6">
                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Full Name *
                                </Text>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your full name"
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>

                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Email
                                </Text>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>

                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Username
                                </Text>
                                <TextInput
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Choose a username"
                                    autoCapitalize="none"
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>

                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Phone Number
                                </Text>
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter your phone number"
                                    keyboardType="phone-pad"
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>

                            {/* Account Type Selection */}
                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Account Type
                                </Text>
                                <View className="flex-row bg-white/60 p-1 rounded-2xl border border-white/40">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsStudent(true);
                                            setAddress('');
                                        }}
                                        className={`flex-1 py-3 rounded-xl items-center ${isStudent ? 'bg-rose-500 shadow-sm' : 'bg-transparent'}`}
                                    >
                                        <Text className={`text-[10px] font-black uppercase tracking-widest ${isStudent ? 'text-white' : 'text-rose-400'}`}>
                                            Student Pal
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setIsStudent(false);
                                            setUniversity('');
                                        }}
                                        className={`flex-1 py-3 rounded-xl items-center ${!isStudent ? 'bg-rose-500 shadow-sm' : 'bg-transparent'}`}
                                    >
                                        <Text className={`text-[10px] font-black uppercase tracking-widest ${!isStudent ? 'text-white' : 'text-rose-400'}`}>
                                            Everyday Pal
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Town Selection */}
                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Town / City *
                                </Text>
                                <TouchableOpacity
                                    onPress={() => openSelection('Select Town', SOUTH_AFRICAN_TOWNS, setTown)}
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 flex-row justify-between items-center"
                                >
                                    <Text className={`font-medium ${town ? 'text-rose-950' : 'text-gray-400'}`}>
                                        {town || 'Select Town'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#fb7185" />
                                </TouchableOpacity>
                            </View>

                            {/* Conditional Fields */}
                            {isStudent ? (
                                <View>
                                    <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                        University *
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openSelection('Select University', SOUTH_AFRICAN_UNIVERSITIES, setUniversity)}
                                        className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 flex-row justify-between items-center"
                                    >
                                        <Text className={`font-medium ${university ? 'text-rose-950' : 'text-gray-400'}`}>
                                            {university || 'Select University'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#fb7185" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                        Delivery Address *
                                    </Text>
                                    <TextInput
                                        value={address}
                                        onChangeText={setAddress}
                                        placeholder="Street Address, Suburb"
                                        className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                        placeholderTextColor="#d1d5db"
                                        multiline
                                    />
                                </View>
                            )}


                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Password *
                                </Text>
                                <View className="relative">
                                    <TextInput
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Create a password"
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

                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                    Confirm Password *
                                </Text>
                                <TextInput
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    secureTextEntry={!showPassword}
                                    className="bg-white/60 border border-white/40 rounded-2xl px-4 py-4 text-rose-950 font-medium"
                                    placeholderTextColor="#d1d5db"
                                />
                            </View>
                        </View>

                        <Text className="text-xs text-gray-400 text-center mb-6">
                            At least one of email, username, or phone is required
                        </Text>

                        {/* Signup Button */}
                        <TouchableOpacity
                            onPress={handleSignup}
                            disabled={isLoading}
                            className="bg-rose-500 py-4 rounded-2xl items-center mb-4 shadow-lg shadow-rose-200"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-sm uppercase tracking-widest">
                                    Create Account
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

                        {/* Google Signup */}
                        <TouchableOpacity
                            onPress={handleGoogleSignup}
                            className="bg-white border border-gray-200 py-4 rounded-2xl flex-row items-center justify-center mb-6"
                        >
                            <Ionicons name="logo-google" size={20} color="#4285F4" />
                            <Text className="ml-2 font-bold text-gray-700">
                                Sign up with Google
                            </Text>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View className="flex-row justify-center">
                            <Text className="text-gray-500">Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text className="text-rose-500 font-bold">Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Selection Modal */}
            <Modal visible={selectionModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[32px] h-[70%]">
                        <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-xl font-black text-rose-950">{selectionTitle}</Text>
                            <TouchableOpacity onPress={() => setSelectionModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        {/* Optional Search Input could go here */}
                        <FlatList
                            data={selectionOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleOptionSelect(item)}
                                    className="p-4 border-b border-gray-50 active:bg-rose-50"
                                >
                                    <Text className="text-base text-gray-700 font-medium">{item}</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SignupScreen;
