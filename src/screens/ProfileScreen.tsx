import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Subscription, Order } from '../types';
import LoginModal from '../components/LoginModal';
import OrderTrackingModal from '../components/OrderTrackingModal';
import CONFIG from '../config';

const ProfileScreen = () => {
    const navigation = useNavigation<any>();
    const { user, isAuthenticated, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loadingSubs, setLoadingSubs] = useState(false);

    const [stats, setStats] = useState({ savings: 0, nextDelivery: null });
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            if (isAuthenticated && user?.id) {
                fetchOrders();
                fetchSubscriptions();
                fetchStats();
            }
        }, [isAuthenticated, user?.id])
    );

    const fetchStats = async () => {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/users/${user?.id}/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/orders?userId=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchSubscriptions = async () => {
        setLoadingSubs(true);
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/subscriptions?userId=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoadingSubs(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: Subscription['status']) => {
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/subscriptions/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                setSubscriptions(prev =>
                    prev.map(sub => (sub.id === id ? { ...sub, status } : sub))
                );
            }
        } catch (error) {
            console.error('Failed to update subscription status:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-rose-50">
                <View className="flex-1 items-center justify-center px-6">
                    {/* Login Prompt Card */}
                    <View className="bg-white/60 backdrop-blur rounded-[32px] p-8 border border-white/40 w-full max-w-sm items-center">
                        <View className="w-24 h-24 bg-rose-100 rounded-3xl items-center justify-center mb-6">
                            <Ionicons name="person-outline" size={48} color="#f43f5e" />
                        </View>

                        <Text className="text-2xl font-black text-rose-950 tracking-tight text-center mb-2">
                            Welcome to PadPal
                        </Text>
                        <Text className="text-gray-500 text-center mb-8">
                            Sign in to manage your subscriptions, track deliveries, and save money
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowLoginModal(true)}
                            className="bg-rose-500 py-4 px-8 rounded-2xl items-center shadow-lg shadow-rose-200 w-full mb-4"
                        >
                            <Text className="text-white font-black text-sm uppercase tracking-widest">
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            className="bg-white/60 py-4 px-8 rounded-2xl items-center border border-white/40 w-full"
                        >
                            <Text className="text-rose-500 font-black text-sm uppercase tracking-widest">
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <LoginModal
                    visible={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    onSignupPress={() => navigation.navigate('Signup')}
                />
            </SafeAreaView>
        );
    }

    // Authenticated user view
    return (
        <SafeAreaView className="flex-1 bg-rose-50">
            <ScrollView className="flex-1 pt-8" showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View className="mx-6 mb-8 bg-white/60 backdrop-blur rounded-[32px] p-8 border border-white/40">
                    {/* User Info */}
                    <View className="flex-row items-center mb-8">
                        {/* Avatar */}
                        <View className="w-20 h-20 bg-rose-500 rounded-3xl items-center justify-center shadow-lg shadow-rose-200 rotate-3 mr-4">
                            <Text className="text-white text-3xl font-black">
                                {getInitials(user?.name || 'User')}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-3xl font-black text-rose-950 tracking-tight">
                                {user?.name || 'User'}
                            </Text>
                            <View className="flex-row gap-2 mt-2">
                                <View className="bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                    <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                        Premium
                                    </Text>
                                </View>
                                <View className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <Text className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                                        Active
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                            <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">
                                Savings
                            </Text>
                            <Text className="text-2xl font-black text-rose-950">R {Number(stats.savings).toFixed(2)}</Text>
                        </View>
                        <View className="flex-1 bg-white/50 rounded-2xl p-4 border border-white/40">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Orders
                            </Text>
                            <Text className="text-2xl font-black text-rose-950">{orders.length}</Text>
                        </View>
                        <View className="flex-1 bg-white/50 rounded-2xl p-4 border border-white/40">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Next
                            </Text>
                            <Text className="text-lg font-black text-rose-950">
                                {stats.nextDelivery ? new Date(stats.nextDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No Data'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Subscriptions Section */}
                <View className="px-6 mb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-2xl font-black text-rose-950 tracking-tight">
                            My <Text className="text-rose-500">Subscriptions</Text>
                        </Text>
                        <View className="bg-white/60 px-3 py-1 rounded-full border border-white/40">
                            <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                Save 15%
                            </Text>
                        </View>
                    </View>

                    {loadingSubs ? (
                        <ActivityIndicator color="#e11d48" />
                    ) : subscriptions.length === 0 ? (
                        <View className="bg-white/40 rounded-3xl p-6 items-center border border-white/40">
                            <Text className="text-gray-400">No active subscriptions</Text>
                        </View>
                    ) : (
                        subscriptions.map(sub => (
                            <View
                                key={sub.id}
                                className={`bg-white/60 backdrop-blur rounded-3xl p-6 mb-4 border border-white/40 ${sub.status === 'Cancelled' ? 'opacity-50' : ''
                                    }`}
                            >
                                {/* Header */}
                                <View className="flex-row justify-between items-start mb-4">
                                    <View
                                        className={`w-14 h-14 rounded-2xl items-center justify-center ${sub.status === 'Active'
                                            ? 'bg-rose-50'
                                            : 'bg-gray-100'
                                            }`}
                                    >
                                        <Ionicons
                                            name="sync"
                                            size={24}
                                            color={sub.status === 'Active' ? '#e11d48' : '#9ca3af'}
                                        />
                                    </View>
                                    <View
                                        className={`px-3 py-1.5 rounded-full border ${sub.status === 'Active'
                                            ? 'bg-green-50 border-green-100'
                                            : sub.status === 'Paused'
                                                ? 'bg-orange-50 border-orange-100'
                                                : 'bg-gray-100 border-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-black uppercase tracking-widest ${sub.status === 'Active'
                                                ? 'text-green-600'
                                                : sub.status === 'Paused'
                                                    ? 'text-orange-600'
                                                    : 'text-gray-500'
                                                }`}
                                        >
                                            {sub.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Product Name */}
                                <Text className="text-xl font-black text-rose-950 mb-1">
                                    {sub.productName}
                                </Text>
                                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                    {sub.frequency} Refill
                                </Text>

                                {/* Details */}
                                <View className="bg-white/60 rounded-2xl p-4 mb-4 border border-white/40">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Price
                                        </Text>
                                        <Text className="font-black text-rose-950">
                                            R {Number(sub.price).toFixed(2)}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Next Delivery
                                        </Text>
                                        <Text className="font-black text-rose-950">
                                            {new Date(sub.nextDelivery).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                {sub.status !== 'Cancelled' && (
                                    <View className="flex-row gap-3">
                                        {sub.status === 'Active' ? (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(sub.id, 'Paused')}
                                                className="flex-1 bg-orange-500 py-4 rounded-2xl items-center shadow-lg"
                                            >
                                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                                    Pause
                                                </Text>
                                            </TouchableOpacity>
                                        ) : sub.status === 'Paused' ? (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(sub.id, 'Active')}
                                                className="flex-1 bg-green-600 py-4 rounded-2xl items-center shadow-lg"
                                            >
                                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                                    Resume
                                                </Text>
                                            </TouchableOpacity>
                                        ) : null}

                                        <TouchableOpacity
                                            onPress={() => handleUpdateStatus(sub.id, 'Cancelled')}
                                            className="px-6 py-4 bg-white/60 rounded-2xl items-center border border-white/40"
                                        >
                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Orders Section */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-black text-rose-950 tracking-tight mb-6">
                        Order <Text className="text-rose-500">History</Text>
                    </Text>

                    {loadingOrders ? (
                        <ActivityIndicator color="#e11d48" />
                    ) : orders.length === 0 ? (
                        <View className="bg-white/40 rounded-3xl p-6 items-center border border-white/40">
                            <Text className="text-gray-400">No orders yet</Text>
                        </View>
                    ) : (
                        orders.map(order => (
                            <View key={order.id} className="bg-white/60 backdrop-blur rounded-3xl p-6 mb-4 border border-white/40">
                                {/* Order Header */}
                                <View className="flex-row justify-between items-center mb-2 border-b border-rose-100 pb-2">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </Text>
                                    <Text className="text-xs font-bold text-rose-950">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </Text>
                                </View>

                                {/* Product List Summary */}
                                <Text className="text-rose-950 font-bold text-lg mb-4" numberOfLines={2}>
                                    {order.product_names || `${order.item_count} items`}
                                </Text>

                                {/* Footer details */}
                                <View className="flex-row justify-between items-center bg-white/40 p-4 rounded-2xl">
                                    <View>
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <View className={`w-2 h-2 rounded-full ${order.status === 'Processing' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                            <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                {order.status}
                                            </Text>
                                        </View>
                                        <Text className="font-bold text-rose-950 text-xs">
                                            {order.type}
                                        </Text>
                                    </View>
                                    <Text className="text-xl font-black text-rose-600">
                                        R {Number(order.total).toFixed(2)}
                                    </Text>
                                </View>

                                {/* Track Order Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedOrder(order);
                                        setShowTrackingModal(true);
                                    }}
                                    className="mt-4 bg-rose-500 py-3 rounded-2xl items-center shadow-lg shadow-rose-200"
                                >
                                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                                        Track Order
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                {/* Logout Button */}
                <View className="px-6 pb-8">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-white/60 backdrop-blur py-4 rounded-2xl items-center border border-white/40"
                    >
                        <Text className="text-rose-400 text-[10px] font-black uppercase tracking-widest">
                            Sign Out
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <OrderTrackingModal
                visible={showTrackingModal}
                onClose={() => setShowTrackingModal(false)}
                order={selectedOrder}
            />
        </SafeAreaView>
    );
};

export default ProfileScreen;
