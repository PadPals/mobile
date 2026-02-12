import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import CheckoutModal from '../components/CheckoutModal';

const CartScreen = () => {
    const navigation = useNavigation<any>();
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [deliveryType, setDeliveryType] = useState<'Drop-off' | 'Pick-up'>('Drop-off');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);


    const deliveryFee = deliveryType === 'Drop-off' ? 35 : 0;
    const total = cartTotal + deliveryFee;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            Alert.alert(
                'Sign In Required',
                'Please sign in to complete your purchase. Your cart will be saved.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign In', onPress: () => setShowLoginModal(true) },
                ]
            );
            return;
        }
        setShowCheckoutModal(true);
    };

    if (cart.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-rose-50">
                <View className="flex-1 justify-center items-center px-8">
                    <View className="w-24 h-24 bg-white/60 rounded-3xl items-center justify-center mb-6 shadow-lg">
                        <Ionicons name="bag-outline" size={48} color="#fda4af" />
                    </View>
                    <Text className="text-4xl font-black text-rose-950 text-center tracking-tight mb-3">
                        Bag is empty
                    </Text>
                    <Text className="text-gray-400 text-center mb-8">
                        Add some products to get started
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-rose-50">
            <ScrollView className="flex-1 pt-8" showsVerticalScrollIndicator={false}>
                <View className="px-6 mb-6">
                    <Text className="text-4xl font-black text-rose-950 tracking-tight">
                        Your <Text className="text-rose-500">Bag</Text>
                    </Text>
                </View>

                {/* Cart Items */}
                <View className="px-6 space-y-4 mb-8">
                    {cart.map(item => (
                        <View
                            key={`${item.id}-${item.isSubscription}`}
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 flex-row border border-white/40"
                        >
                            {/* Product Image */}
                            <View className="w-20 h-20 rounded-2xl overflow-hidden bg-rose-100 mr-4">
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </View>

                            {/* Product Info */}
                            <View className="flex-1 justify-between">
                                <View>
                                    <Text className="font-black text-rose-950 text-base" numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        <Text className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                                            {item.category}
                                        </Text>
                                        {item.isSubscription && (
                                            <View className="bg-rose-100 px-2 py-0.5 rounded-full">
                                                <Text className="text-[8px] font-black text-rose-600 uppercase">
                                                    Monthly
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-2">
                                    {/* Quantity Controls */}
                                    <View className="flex-row items-center bg-white/60 rounded-xl p-1">
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 items-center justify-center"
                                        >
                                            <Ionicons name="remove" size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                        <Text className="px-3 font-black text-rose-950 text-sm">
                                            {item.quantity}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 items-center justify-center"
                                        >
                                            <Ionicons name="add" size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text className="font-black text-rose-600 text-lg">
                                        R {(item.price * item.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            </View>

                            {/* Remove Button */}
                            <TouchableOpacity
                                onPress={() => removeFromCart(item.id)}
                                className="absolute top-2 right-2 p-2"
                            >
                                <Ionicons name="close" size={16} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Summary Card */}
                <View className="px-6 pb-8">
                    <View className="bg-white/60 backdrop-blur-sm rounded-[32px] p-6 border border-white/40">
                        <Text className="text-2xl font-black text-rose-950 mb-6">Summary</Text>

                        {/* Subtotal */}
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Subtotal
                            </Text>
                            <Text className="font-black text-rose-950">R {cartTotal.toFixed(2)}</Text>
                        </View>

                        {/* Delivery Options */}
                        <View className="mb-6">
                            <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">
                                Delivery
                            </Text>
                            <View className="flex-row gap-3">
                                {(['Drop-off', 'Pick-up'] as const).map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => setDeliveryType(type)}
                                        className={`flex-1 py-4 rounded-2xl items-center ${deliveryType === type
                                            ? 'bg-rose-500 shadow-lg'
                                            : 'bg-white/40 border border-white/60'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-black uppercase tracking-widest ${deliveryType === type ? 'text-white' : 'text-gray-400'
                                                }`}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Total */}
                        <View className="bg-rose-50 rounded-2xl p-4 flex-row justify-between items-center mb-6">
                            <Text className="text-[10px] font-black text-rose-950 uppercase tracking-widest">
                                Total
                            </Text>
                            <Text className="text-2xl font-black text-rose-600">R {total.toFixed(2)}</Text>
                        </View>

                        {/* Login Notice */}
                        {!isAuthenticated && (
                            <View className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-4">
                                <Text className="text-amber-700 text-xs text-center">
                                    Sign in required to complete checkout
                                </Text>
                            </View>
                        )}

                        {/* Checkout Button */}
                        <TouchableOpacity
                            onPress={handleCheckout}
                            className="bg-rose-500 py-5 rounded-3xl items-center shadow-lg shadow-rose-200"
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-widest">
                                {isAuthenticated ? 'Checkout' : 'Sign In to Checkout'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <LoginModal
                visible={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSignupPress={() => navigation.navigate('Signup')}
            />

            <CheckoutModal
                visible={showCheckoutModal}
                onClose={() => setShowCheckoutModal(false)}
                cart={cart}
                total={total}
                deliveryType={deliveryType}
                onComplete={() => {
                    setShowCheckoutModal(false);
                    clearCart();
                    navigation.navigate('Shop');
                }}
            />
        </SafeAreaView>
    );
};

export default CartScreen;
