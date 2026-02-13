export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

export interface CartItem extends Product {
    quantity: number;
    isSubscription?: boolean;
}

export interface Subscription {
    id: string;
    productId: string;
    productName: string;
    price: number;
    status: 'Active' | 'Paused' | 'Cancelled';
    frequency: 'Monthly' | 'Every 2 Months';
    nextDelivery: string;
}

export interface User {
    id: string;
    email?: string;
    username?: string;
    phone?: string;
    name: string;
    googleId?: string;
    age?: number;
    town?: string;
    country?: string;
    isStudent?: boolean;
    university?: string;
    address?: string;
    padSize?: string;
    preferredDeductionDate?: string;
}

export interface PeriodEntry {
    id?: string;
    startDate: string;
    endDate?: string;
    flow?: string;
}

export interface Order {
    id: string;
    user_id: string;
    total: number;
    status: string;
    type: string;
    product_names?: string;
    item_count?: number;
    created_at: string;
}

export interface OrderTracking {
    id: string;
    order_id: string;
    status: 'Filled' | 'Processed' | 'Packaged' | 'Out for Delivery' | 'Delivered';
    location: string;
    timestamp: string;
}
