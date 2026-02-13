import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Platform, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CONFIG from '../config';

const API_URL = CONFIG.BASE_URL;

const categories = ['All', 'regular', 'super', 'overnight', 'liner'];

const ShopScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [purchaseMode, setPurchaseMode] = useState<Record<string, 'once' | 'sub'>>({});
    const [refreshing, setRefreshing] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleAddToCart = (product: Product, isSub: boolean) => {
        addToCart(product, isSub);
    };

    const toggleMode = (productId: string, mode: 'once' | 'sub') => {
        setPurchaseMode(prev => ({ ...prev, [productId]: mode }));
    };

    const filteredProducts = useMemo(() => {
        return filter === 'All'
            ? products
            : products.filter(p => p.category === filter);
    }, [products, filter]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-rose-50">
                <ActivityIndicator size="large" color="#e11d48" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-rose-50 pt-8">
            <View className="px-6 mb-6">
                <Text className="text-4xl font-black text-rose-950 tracking-tighter">
                    Our <Text className="text-rose-500">Essentials</Text>
                </Text>
                <Text className="text-gray-500 font-medium mt-1">
                    Curated care for every stage.
                </Text>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-6"
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setFilter(cat)}
                            className={`px-6 py-2 rounded-full mr-2 border ${filter === cat
                                ? 'bg-rose-500 border-rose-500 shadow-md shadow-rose-200'
                                : 'bg-white/40 border-white/60'
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === cat ? 'text-white' : 'text-gray-400'
                                }`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        isSub={purchaseMode[item.id] === 'sub'}
                        onToggleMode={(mode: 'once' | 'sub') => toggleMode(item.id, mode)}
                        onAdd={(p: Product) => handleAddToCart(p, purchaseMode[item.id] === 'sub')}
                    />
                )}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#e11d48']} // Android
                        tintColor="#e11d48" // iOS
                    />
                }
            />
        </SafeAreaView>
    );
};

export default ShopScreen;
