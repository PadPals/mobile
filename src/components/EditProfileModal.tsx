import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';
import { SOUTH_AFRICAN_TOWNS, SOUTH_AFRICAN_UNIVERSITIES, PAD_SIZES } from '../constants';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: (data: Partial<User>) => Promise<boolean>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose, user, onUpdate }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [phone, setPhone] = useState('');
    const [town, setTown] = useState('');
    const [isStudent, setIsStudent] = useState(true);
    const [university, setUniversity] = useState('');
    const [address, setAddress] = useState('');
    const [padSize, setPadSize] = useState('Regular');
    const [preferredDeductionDate, setPreferredDeductionDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Selection Modal State
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionTitle, setSelectionTitle] = useState('');
    const [selectionOptions, setSelectionOptions] = useState<string[]>([]);
    const [onSelectOption, setOnSelectOption] = useState<(option: string) => void>(() => { });

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAge(user.age?.toString() || '');
            setPhone(user.phone || '');
            setTown(user.town || '');
            setIsStudent(user.isStudent !== false); // Default true
            setUniversity(user.university || '');
            setAddress(user.address || '');
            setPadSize(user.padSize || 'Regular');
            setPreferredDeductionDate(user.preferredDeductionDate || '');
        }
    }, [user, visible]);

    const handleSave = async () => {
        setLoading(true);
        const success = await onUpdate({
            name,
            age: age ? parseInt(age) : undefined,
            phone,
            town,
            isStudent,
            university: isStudent ? university : undefined, // Clear university if not student
            address: !isStudent ? address : undefined, // Clear address if student
            padSize,
            preferredDeductionDate: preferredDeductionDate || undefined // Send undefined if empty string
        });
        setLoading(false);
        if (success) {
            onClose();
        }
    };

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

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-end">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="bg-rose-50 rounded-t-[32px] h-[90%]"
                >
                    {/* Header */}
                    <View className="bg-white/80 p-6 rounded-t-[32px] flex-row justify-between items-center border-b border-rose-100/50">
                        <Text className="text-2xl font-black text-rose-950 tracking-tight">
                            Edit <Text className="text-rose-500">Profile</Text>
                        </Text>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                        <View className="gap-4 mb-20">
                            {/* Basic Info */}
                            <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2">
                                Personal Info
                            </Text>
                            <View className="gap-3">
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Full Name"
                                    className="bg-white/60 p-4 rounded-2xl border border-white/40 text-rose-950 font-medium"
                                />
                                <View className="flex-row gap-3">
                                    <TextInput
                                        value={age}
                                        onChangeText={setAge}
                                        placeholder="Age"
                                        keyboardType="numeric"
                                        className="flex-1 bg-white/60 p-4 rounded-2xl border border-white/40 text-rose-950 font-medium"
                                    />
                                    <TextInput
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder="Phone"
                                        keyboardType="phone-pad"
                                        className="flex-[2] bg-white/60 p-4 rounded-2xl border border-white/40 text-rose-950 font-medium"
                                    />
                                </View>
                            </View>

                            {/* Account Type Selection */}
                            <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2">
                                Account Type
                            </Text>
                            <View className="flex-row bg-white/60 p-1 rounded-2xl border border-white/40">
                                <TouchableOpacity
                                    onPress={() => setIsStudent(true)}
                                    className={`flex-1 py-3 rounded-xl items-center ${isStudent ? 'bg-rose-500 shadow-sm' : 'bg-transparent'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isStudent ? 'text-white' : 'text-rose-400'}`}>
                                        Student Pal
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setIsStudent(false)}
                                    className={`flex-1 py-3 rounded-xl items-center ${!isStudent ? 'bg-rose-500 shadow-sm' : 'bg-transparent'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${!isStudent ? 'text-white' : 'text-rose-400'}`}>
                                        Everyday Pal
                                    </Text>
                                </TouchableOpacity>
                            </View>


                            {/* Location / University Logic */}
                            {isStudent ? (
                                <View>
                                    <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2 mb-2">
                                        University
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => openSelection('Select University', SOUTH_AFRICAN_UNIVERSITIES, setUniversity)}
                                        className="bg-white/60 p-4 rounded-2xl border border-white/40 flex-row justify-between items-center"
                                    >
                                        <Text className={`font-medium ${university ? 'text-rose-950' : 'text-gray-400'}`}>
                                            {university || 'Select University'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#fb7185" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2 mb-2">
                                        Delivery Address
                                    </Text>
                                    <TextInput
                                        value={address}
                                        onChangeText={setAddress}
                                        placeholder="Street Address, Suburb"
                                        className="bg-white/60 p-4 rounded-2xl border border-white/40 text-rose-950 font-medium"
                                        multiline
                                    />
                                </View>
                            )}

                            {/* Town Selection */}
                            <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2">
                                Town / City
                            </Text>
                            <TouchableOpacity
                                onPress={() => openSelection('Select Town', SOUTH_AFRICAN_TOWNS, setTown)}
                                className="bg-white/60 p-4 rounded-2xl border border-white/40 flex-row justify-between items-center"
                            >
                                <Text className={`font-medium ${town ? 'text-rose-950' : 'text-gray-400'}`}>
                                    {town || 'Select Town or City'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#fb7185" />
                            </TouchableOpacity>

                            {/* Preferences */}
                            <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2">
                                Preferences
                            </Text>
                            <View className="flex-row gap-2 flex-wrap">
                                {PAD_SIZES.slice(0, 4).map(size => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setPadSize(size)}
                                        className={`flex-grow py-3 px-2 rounded-xl items-center border ${padSize === size ? 'bg-rose-500 border-rose-500' : 'bg-white/40 border-white/40'}`}
                                    >
                                        <Text className={`text-[10px] font-black uppercase ${padSize === size ? 'text-white' : 'text-rose-950'}`}>
                                            {size.replace('Ultra-Thin ', '')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-xs font-black text-rose-400 uppercase tracking-widest mt-2">
                                Preferred Debit Date
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={() => setPreferredDeductionDate('')}
                                    className={`mr-2 px-4 h-12 rounded-full items-center justify-center border ${preferredDeductionDate === '' ? 'bg-rose-500 border-rose-500' : 'bg-white/40 border-white/40'}`}
                                >
                                    <Text className={`font-bold ${preferredDeductionDate === '' ? 'text-white' : 'text-rose-950'}`}>
                                        Manual
                                    </Text>
                                </TouchableOpacity>
                                {['1st', '5th', '15th', '20th', '25th', '30th'].map(date => (
                                    <TouchableOpacity
                                        key={date}
                                        onPress={() => setPreferredDeductionDate(date)}
                                        className={`mr-2 w-12 h-12 rounded-full items-center justify-center border ${preferredDeductionDate === date ? 'bg-rose-500 border-rose-500' : 'bg-white/40 border-white/40'}`}
                                    >
                                        <Text className={`font-bold ${preferredDeductionDate === date ? 'text-white' : 'text-rose-950'}`}>
                                            {date}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </View>
                    </ScrollView>

                    {/* Footer Save Button */}
                    <View className="p-6 bg-white/80 border-t border-rose-100/50">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            className="bg-rose-500 py-4 rounded-2xl items-center shadow-lg shadow-rose-200"
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-sm uppercase tracking-widest">
                                    Save Changes
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>

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
        </Modal>
    );
};

export default EditProfileModal;
