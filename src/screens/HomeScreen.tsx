import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="flex-1 bg-rose-50">
            {/* Background Gradient Blobs */}
            <View className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
                <View
                    className="absolute top-[5%] left-[-20%] w-72 h-72 rounded-full opacity-30"
                    style={{ backgroundColor: '#fecdd3' }}
                />
                <View
                    className="absolute bottom-[20%] right-[-15%] w-80 h-80 rounded-full opacity-20"
                    style={{ backgroundColor: '#fcd5ce' }}
                />
                <View
                    className="absolute top-[40%] left-[50%] w-56 h-56 rounded-full opacity-25"
                    style={{ backgroundColor: '#fbcfe8' }}
                />
            </View>

            {/* Content */}
            <View className="flex-1 px-6 pt-8 justify-between pb-8">
                {/* Header */}
                <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-rose-500 rounded-2xl items-center justify-center shadow-lg mr-3 rotate-3">
                        <Text className="text-white text-xl">❤️</Text>
                    </View>
                    <View>
                        <Text className="text-2xl font-black text-rose-950 tracking-tight">PadPal</Text>
                        <Text className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                            Monthly Care
                        </Text>
                    </View>
                </View>

                {/* Hero Section */}
                <View className="flex-1 justify-center">
                    {/* Badge */}
                    <View className="self-start bg-white/60 backdrop-blur px-4 py-2 rounded-full mb-6 border border-white/40">
                        <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                            Care • Comfort • Community
                        </Text>
                    </View>

                    {/* Main Headline */}
                    <Text className="text-5xl font-black text-rose-950 leading-none tracking-tight mb-4">
                        Monthly Care,{'\n'}
                        <Text className="text-rose-500">Automated.</Text>
                    </Text>

                    {/* Subtitle */}
                    <Text className="text-lg text-gray-500 leading-relaxed mb-10 font-medium">
                        PadPal tracks your cycle and predicts exactly when you'll need your essentials.
                        Stop worry-shopping, start living.
                    </Text>

                    {/* CTA Buttons */}
                    <View className="gap-4">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Shop' as never)}
                            className="bg-rose-500 py-5 rounded-[28px] items-center shadow-lg shadow-rose-200"
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-widest">
                                Shop Now
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Tracker' as never)}
                            className="bg-white/60 backdrop-blur py-5 rounded-[28px] items-center border border-white/60"
                        >
                            <Text className="text-rose-600 font-black text-lg uppercase tracking-widest">
                                Track Cycle
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bottom Stats */}
                <View className="flex-row justify-around bg-white/40 backdrop-blur rounded-3xl p-4 border border-white/40">
                    <View className="items-center">
                        <Text className="text-2xl font-black text-rose-600">15%</Text>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Save on Subs
                        </Text>
                    </View>
                    <View className="w-px bg-rose-100" />
                    <View className="items-center">
                        <Text className="text-2xl font-black text-rose-600">Free</Text>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Tracking
                        </Text>
                    </View>
                    <View className="w-px bg-rose-100" />
                    <View className="items-center">
                        <Text className="text-2xl font-black text-rose-600">24hr</Text>
                        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Delivery
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;
