import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import CONFIG from '../config';

interface ProductCardProps {
    product: Product;
    isSub: boolean;
    onToggleMode: (mode: 'once' | 'sub') => void;
    onAdd: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSub, onToggleMode, onAdd }) => {
    const displayPrice = isSub ? product.price * 0.85 : product.price;

    return (
        <View className="bg-white/40 rounded-[2.5rem] overflow-hidden mb-8 border border-white/50 shadow-sm">
            {/* Image Container */}
            <View className="h-64 bg-gray-100 relative">
                <Image
                    source={{
                        uri: product.image.startsWith('http')
                            ? product.image
                            : `${CONFIG.ASSETS_URL}${product.image.startsWith('/') ? '' : '/'}${product.image}`
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-4 right-4 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full">
                    <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                        {product.category}
                    </Text>
                </View>
            </View>

            {/* Content */}
            <View className="p-8">
                <Text className="text-xl font-black text-rose-950 mb-2 leading-tight">
                    {product.name}
                </Text>
                <Text className="text-gray-500 text-xs font-medium mb-6 leading-relaxed" numberOfLines={2}>
                    {product.description}
                </Text>

                {/* Subscription Toggle */}
                <View className="bg-white/40 p-1 rounded-2xl flex-row mb-6 border border-white/60">
                    <TouchableOpacity
                        onPress={() => onToggleMode('once')}
                        className={`flex-1 py-3 rounded-xl items-center justify-center ${!isSub ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${!isSub ? 'text-rose-600' : 'text-gray-400'}`}>
                            Once-off
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onToggleMode('sub')}
                        className={`flex-1 py-3 rounded-xl items-center justify-center ${isSub ? 'bg-rose-500 shadow-md' : ''}`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${isSub ? 'text-white' : 'text-gray-400'}`}>
                            Sub & Save
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between mt-auto">
                    <View>
                        <Text className="text-3xl font-black text-rose-950">
                            R {Number(displayPrice).toFixed(2)}
                        </Text>
                        {isSub && (
                            <Text className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">
                                Save 15%
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => onAdd(product)}
                        className="w-14 h-14 bg-rose-500 rounded-2xl items-center justify-center shadow-xl shadow-rose-200 active:scale-95"
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ProductCard;
