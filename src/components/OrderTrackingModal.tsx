import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderTracking } from '../types';
import CONFIG from '../config';

interface OrderTrackingModalProps {
    visible: boolean;
    onClose: () => void;
    order: Order | null;
}

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
    visible,
    onClose,
    order,
}) => {
    const [trackingData, setTrackingData] = useState<OrderTracking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && order) {
            fetchTrackingData();
        }
    }, [visible, order]);

    const fetchTrackingData = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const response = await fetch(`${CONFIG.BASE_URL}/orders/${order.id}/tracking`);
            if (response.ok) {
                const data = await response.json();
                setTrackingData(data);
            }
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Order Filled', icon: 'clipboard' },
        { title: 'Processed', icon: 'cog' },
        { title: 'Packaged', icon: 'cube' },
        { title: 'Out for Delivery', icon: 'bicycle' }, // using bicycle as a proxy for delivery vehicle if needed, or 'car'
        { title: 'Delivered', icon: 'checkmark-circle' },
    ];

    const getCurrentStepIndex = () => {
        if (trackingData.length === 0) return -1;
        const lastStatus = trackingData[trackingData.length - 1].status;
        return steps.findIndex(step => step.title === lastStatus);
    };

    const currentStepIndex = getCurrentStepIndex();

    const getStatusTimestamp = (status: string) => {
        const entry = trackingData.find(d => d.status === status);
        if (!entry) return null;
        return new Date(entry.timestamp).toLocaleString();
    };

    const getDeliveryInfo = () => {
        const deliveredEntry = trackingData.find(d => d.status === 'Delivered');
        if (deliveredEntry) {
            return `Delivered to ${deliveredEntry.location}`;
        }
        return null;
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-rose-50">
                {/* Header */}
                <View className="px-6 pt-6 pb-4 flex-row items-center justify-between bg-rose-50">
                    <Text className="text-2xl font-black text-rose-950 tracking-tight">
                        Track Order
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 bg-white/60 rounded-full items-center justify-center border border-white/40"
                    >
                        <Ionicons name="close" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator color="#e11d48" size="large" />
                    </View>
                ) : (
                    <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                        <View className="bg-white/60 backdrop-blur rounded-[2.5rem] p-8 border border-white/40 mb-6">
                            <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">
                                Order #{order?.id.slice(-6).toUpperCase()}
                            </Text>
                            <Text className="text-3xl font-black text-rose-950 mb-1">
                                {order?.status}
                            </Text>
                            {getDeliveryInfo() && (
                                <Text className="text-sm font-bold text-gray-500 mt-2">
                                    {getDeliveryInfo()}
                                </Text>
                            )}
                        </View>

                        {/* Timeline */}
                        <View className="mb-8">
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const timestamp = getStatusTimestamp(step.title);

                                return (
                                    <View key={index} className="flex-row mb-6 relative">
                                        {/* Line connector */}
                                        {index !== steps.length - 1 && (
                                            <View
                                                className={`absolute left-[1.35rem] top-10 w-1 h-full rounded-full ${index < currentStepIndex ? 'bg-rose-500' : 'bg-gray-200'
                                                    }`}
                                                style={{ height: 40 }}
                                            />
                                        )}

                                        {/* Icon */}
                                        <View
                                            className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 shadow-sm z-10 ${isCompleted ? 'bg-rose-500 shadow-rose-200' : 'bg-white'
                                                }`}
                                        >
                                            <Ionicons
                                                name={step.icon as any}
                                                size={20}
                                                color={isCompleted ? 'white' : '#d1d5db'}
                                            />
                                        </View>

                                        {/* Text */}
                                        <View className="flex-1 justify-center">
                                            <Text
                                                className={`text-lg font-black ${isCompleted ? 'text-rose-950' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.title}
                                            </Text>
                                            {timestamp && (
                                                <Text className="text-xs font-bold text-gray-400 mt-1">
                                                    {timestamp}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
};

export default OrderTrackingModal;
