import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../types';
import { useAuth } from '../context/AuthContext';
import CONFIG from '../config';

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
    cart: CartItem[];
    total: number;
    deliveryType: string;
    onComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
    visible,
    onClose,
    cart,
    total,
    deliveryType,
    onComplete,
}) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [orderId, setOrderId] = useState('');

    // Form State
    const [form, setForm] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card');

    const handleInputChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handlePayment = async () => {
        // Validation
        if (!form.name || !form.phone || !form.address) {
            Alert.alert('Missing Fields', 'Please fill in all delivery details.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${CONFIG.BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    total: total,
                    type: deliveryType,
                    status: 'Processing',
                    items: cart
                }),
            });

            if (!response.ok) {
                throw new Error('Order creation failed');
            }

            const data = await response.json();
            setOrderId(data.id);

            // Simulate Payment delay if needed, or just proceed
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setLoading(false);
            setStep('success');

            // Auto close after success
            setTimeout(() => {
                onComplete();
                setStep('form');
            }, 3000);

        } catch (error) {
            setLoading(false);
            Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
            console.error(error);
        }
    };

    if (step === 'success') {
        return (
            <Modal visible={visible} animationType="fade" transparent>
                <View className="flex-1 bg-rose-50/95 justify-center items-center px-8">
                    <View className="w-24 h-24 bg-rose-500 rounded-[2.5rem] items-center justify-center mb-8 shadow-2xl shadow-rose-300">
                        <Ionicons name="checkmark" size={48} color="white" />
                    </View>
                    <Text className="text-4xl font-black text-rose-950 text-center mb-4 tracking-tighter">
                        Order Confirmed!
                    </Text>
                    <Text className="text-gray-500 text-center mb-8 font-medium">
                        We've received your request. Redirecting you back...
                    </Text>
                    <View className="bg-white/60 p-6 rounded-[2rem] border border-white/40 w-full">
                        <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                            Reference
                        </Text>
                        <Text className="text-2xl font-black text-rose-950">
                            #{orderId || 'PP-PENDING'}
                        </Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-rose-50">
                {/* Header */}
                <View className="px-6 pt-6 pb-4 flex-row items-center justify-between bg-rose-50">
                    <Text className="text-2xl font-black text-rose-950 tracking-tight">Checkout</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 bg-white/60 rounded-full items-center justify-center border border-white/40"
                    >
                        <Ionicons name="close" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                        {/* Summary Card */}
                        <View className="bg-white/40 border border-white/60 p-6 rounded-[2.5rem] mb-6">
                            <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">
                                Order Summary
                            </Text>
                            <View className="space-y-4 mb-4 border-b border-rose-100 pb-4">
                                {cart.map((item) => (
                                    <View key={item.id} className="flex-row justify-between items-center">
                                        <View className="flex-row items-center flex-1 mr-4">
                                            <View className="w-8 h-8 bg-white rounded-lg mr-3 shadow-sm" />
                                            <View>
                                                <Text className="text-xs font-bold text-rose-950" numberOfLines={1}>
                                                    {item.name}
                                                </Text>
                                                <Text className="text-[10px] text-gray-400">Qty: {item.quantity}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs font-black text-rose-600">
                                            R {(item.price * item.quantity).toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="font-bold text-rose-950">Total to Pay</Text>
                                <Text className="text-2xl font-black text-rose-600">R {total.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Delivery Details */}
                        <View className="mb-6 space-y-4">
                            <Text className="text-lg font-black text-rose-950 ml-2">Delivery Details</Text>

                            <TextInput
                                placeholder="Full Name"
                                value={form.name}
                                onChangeText={(t) => handleInputChange('name', t)}
                                className="bg-white/60 border border-white/40 p-4 rounded-2xl font-medium text-rose-950"
                                placeholderTextColor="#9ca3af"
                            />
                            <TextInput
                                placeholder="Phone Number"
                                keyboardType="phone-pad"
                                value={form.phone}
                                onChangeText={(t) => handleInputChange('phone', t)}
                                className="bg-white/60 border border-white/40 p-4 rounded-2xl font-medium text-rose-950"
                                placeholderTextColor="#9ca3af"
                            />
                            <TextInput
                                placeholder="Street Address"
                                value={form.address}
                                onChangeText={(t) => handleInputChange('address', t)}
                                className="bg-white/60 border border-white/40 p-4 rounded-2xl font-medium text-rose-950"
                                placeholderTextColor="#9ca3af"
                            />
                            <View className="flex-row gap-4">
                                <TextInput
                                    placeholder="City"
                                    value={form.city}
                                    onChangeText={(t) => handleInputChange('city', t)}
                                    className="flex-1 bg-white/60 border border-white/40 p-4 rounded-2xl font-medium text-rose-950"
                                    placeholderTextColor="#9ca3af"
                                />
                                <TextInput
                                    placeholder="Zip Code"
                                    keyboardType="numeric"
                                    value={form.zip}
                                    onChangeText={(t) => handleInputChange('zip', t)}
                                    className="w-24 bg-white/60 border border-white/40 p-4 rounded-2xl font-medium text-rose-950"
                                    placeholderTextColor="#9ca3af"
                                />
                            </View>
                        </View>

                        {/* Payment Method */}
                        <View className="mb-8">
                            <Text className="text-lg font-black text-rose-950 ml-2 mb-4">Payment Method</Text>
                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => setPaymentMethod('card')}
                                    className={`flex-1 p-6 rounded-3xl border-2 ${paymentMethod === 'card'
                                        ? 'bg-white border-rose-500 shadow-lg shadow-rose-100'
                                        : 'bg-white/40 border-transparent'
                                        }`}
                                >
                                    <Ionicons
                                        name="card"
                                        size={24}
                                        color={paymentMethod === 'card' ? '#f43f5e' : '#d1d5db'}
                                    />
                                    <Text
                                        className={`mt-2 font-black text-xs uppercase tracking-widest ${paymentMethod === 'card' ? 'text-rose-950' : 'text-gray-400'
                                            }`}
                                    >
                                        Card
                                    </Text>
                                    {paymentMethod === 'card' && (
                                        <View className="absolute top-3 right-3 bg-rose-500 w-5 h-5 rounded-full items-center justify-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setPaymentMethod('mobile')}
                                    className={`flex-1 p-6 rounded-3xl border-2 ${paymentMethod === 'mobile'
                                        ? 'bg-white border-rose-500 shadow-lg shadow-rose-100'
                                        : 'bg-white/40 border-transparent'
                                        }`}
                                >
                                    <Ionicons
                                        name="phone-portrait"
                                        size={24}
                                        color={paymentMethod === 'mobile' ? '#f43f5e' : '#d1d5db'}
                                    />
                                    <Text
                                        className={`mt-2 font-black text-xs uppercase tracking-widest ${paymentMethod === 'mobile' ? 'text-rose-950' : 'text-gray-400'
                                            }`}
                                    >
                                        Mobile
                                    </Text>
                                    {paymentMethod === 'mobile' && (
                                        <View className="absolute top-3 right-3 bg-rose-500 w-5 h-5 rounded-full items-center justify-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="h-24" />
                    </ScrollView>

                    {/* Footer / Pay Button */}
                    <View className="absolute bottom-0 left-0 right-0 p-6 bg-rose-50/80 blur-lg border-t border-rose-100">
                        <TouchableOpacity
                            onPress={handlePayment}
                            disabled={loading}
                            className={`w-full py-5 rounded-[2rem] items-center shadow-xl ${loading ? 'bg-rose-300' : 'bg-rose-500 shadow-rose-200'
                                }`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-lg uppercase tracking-widest">
                                    Pay R {total.toFixed(2)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default CheckoutModal;
