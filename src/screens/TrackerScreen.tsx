import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert,
    Platform,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { PeriodEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import CONFIG from '../config';

const API_URL = CONFIG.BASE_URL;

/**
 * Parse "YYYY-MM-DD" into a LOCAL Date at midnight.
 * Avoids iOS Invalid Date issues with new Date("YYYY-MM-DD").
 */
const parseDateOnly = (ymd: string) => {
    if (!ymd || typeof ymd !== 'string') return null;

    const [yStr, mStr, dStr] = ymd.split('-');
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);

    if (!y || !m || !d) return null;

    const dt = new Date(y, m - 1, d); // local midnight
    return isNaN(dt.getTime()) ? null : dt;
};

/**
 * Format Date -> "YYYY-MM-DD" using LOCAL time (not UTC).
 */
const formatDateOnlyLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

/**
 * Safely normalize backend date strings (ISO or YMD) to local YYYY-MM-DD.
 * Fixes issues where ISO strings with timezone offsets (e.g. 22:00 UTC previous day)
 * were being destructively sliced.
 */
const normalizeBackendDate = (val: any) => {
    if (!val) return '';
    const str = String(val);

    // If it's already a simple YYYY-MM-DD string, trust it
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Otherwise parse full string (handles ISO T/Z) and convert to local YMD
    const dt = new Date(str);
    return isNaN(dt.getTime()) ? '' : formatDateOnlyLocal(dt);
};

/**
 * Strict validator for YYYY-MM-DD (rejects impossible dates like 2025-02-31).
 */
const isValidYMD = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const dt = parseDateOnly(s);
    return !!dt && formatDateOnlyLocal(dt) === s;
};

/**
 * dd mmm display helpers (e.g., 05 Jan)
 */
const formatDDMMMFromDate = (date: Date) =>
    date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });

const formatDDMMMFromYMD = (ymd: string) => {
    const dt = parseDateOnly(ymd);
    return dt ? formatDDMMMFromDate(dt) : ymd;
};

const TrackerScreen = () => {
    // ----------------------------
    // Auth
    // ----------------------------
    const { user, isAuthenticated } = useAuth();

    // ----------------------------
    // State
    // ----------------------------
    const [entries, setEntries] = useState<PeriodEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);

    const todayYMD = formatDateOnlyLocal(new Date());

    const [newEntry, setNewEntry] = useState({
        startDate: todayYMD,
        endDate: todayYMD,
        flow: 'Medium',
    });

    // Calendar month view
    const [viewDate, setViewDate] = useState(new Date());

    // Inline picker state
    const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');
    const [showPicker, setShowPicker] = useState(false);

    // Date objects for picker (no parsing issues)
    const [startDateObj, setStartDateObj] = useState<Date>(new Date());
    const [endDateObj, setEndDateObj] = useState<Date>(new Date());

    // ----------------------------
    // Effects
    // ----------------------------
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchEntries();
        } else {
            setLoading(false);
            setEntries([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user?.id]);

    // When opening the modal, sync picker dates to current entry strings
    useEffect(() => {
        if (!showLogModal) {
            setShowPicker(false);
            return;
        }

        const s = parseDateOnly(newEntry.startDate) ?? new Date();
        const e = parseDateOnly(newEntry.endDate) ?? s;

        setStartDateObj(s);
        setEndDateObj(e);
        setPickerTarget('start');
        setShowPicker(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showLogModal]);

    // ----------------------------
    // Data Fetch
    // ----------------------------
    const fetchEntries = async (isRefreshing = false) => {
        if (!user?.id) return;

        if (!isRefreshing) setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/tracker`, {
                params: { userId: user.id },
            });

            // Support multiple API shapes:
            const raw =
                (Array.isArray(response.data) && response.data) ||
                (Array.isArray(response.data?.entries) && response.data.entries) ||
                (Array.isArray(response.data?.data) && response.data.data) ||
                [];

            // Normalize keys (camelCase or snake_case) and guard values
            const normalized: PeriodEntry[] = raw
                .map((e: any) => {
                    const start = e?.startDate ?? e?.start_date;
                    const end = e?.endDate ?? e?.end_date;

                    const startStr = normalizeBackendDate(start);
                    const endStr = end != null ? normalizeBackendDate(end) : undefined;

                    return {
                        ...e,
                        startDate: startStr,
                        endDate: endStr,
                        flow: e?.flow ?? 'Medium',
                    };
                })
                .filter((e: any) => /^\d{4}-\d{2}-\d{2}$/.test(e.startDate));

            setEntries(normalized);
        } catch (error) {
            console.error('Error fetching tracker entries:', error);

            // Optional mock fallback for UI testing if API fails
            if (entries.length === 0) {
                setEntries([
                    { startDate: '2025-01-05', endDate: '2025-01-10', flow: 'Medium' },
                    { startDate: '2025-02-02', endDate: '2025-02-07', flow: 'Heavy' },
                ] as any);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchEntries(true);
    };

    // ----------------------------
    // Save Entry
    // ----------------------------
    const handleSaveEntry = async () => {
        if (!isAuthenticated) {
            setShowLogModal(false);
            Alert.alert('Sign In Required', 'Please log in to save your cycle data.');
            return;
        }
        if (!user?.id) return;

        const start = newEntry.startDate.trim();
        const end = newEntry.endDate.trim();

        if (!isValidYMD(start) || !isValidYMD(end)) {
            Alert.alert('Invalid Date', 'Something went wrong with the selected dates.');
            return;
        }

        if (end < start) {
            Alert.alert('Invalid Range', 'End date cannot be before start date.');
            return;
        }

        const previousEntries = [...entries];

        try {
            // Optimistic update
            const optimisticEntry: PeriodEntry = {
                ...(newEntry as any),
                startDate: start,
                endDate: end,
                id: Math.random().toString(),
            };

            setEntries((prev) => [...prev, optimisticEntry]);
            setShowLogModal(false);

            // API call
            try {
                await axios.post(`${API_URL}/tracker`, {
                    ...newEntry,
                    startDate: start,
                    endDate: end,
                    userId: user.id,
                });

                fetchEntries(); // refresh to get real id
            } catch (apiError: any) {
                setEntries(previousEntries);
                const errorMsg = apiError.response?.data?.details || apiError.message;
                const errorCode = apiError.response?.data?.code || '500';
                Alert.alert('Save Failed', `${errorMsg}\n(Code: ${errorCode})`);
            }
        } catch (error) {
            console.error('Error saving entry:', error);
            setEntries(previousEntries);
        }
    };

    // ----------------------------
    // Inline Date Picker Logic
    // ----------------------------
    const openPicker = (target: 'start' | 'end') => {
        setPickerTarget(target);
        setShowPicker(true);
    };

    const onChangePicker = (event: DateTimePickerEvent, selected?: Date) => {
        if (event.type === 'dismissed') {
            // Android dismissed
            setShowPicker(false);
            return;
        }

        const picked =
            selected ??
            (pickerTarget === 'start' ? startDateObj : endDateObj);

        if (pickerTarget === 'start') {
            setStartDateObj(picked);

            // If start > end, shift end to match start
            if (picked.getTime() > endDateObj.getTime()) {
                setEndDateObj(picked);
                setNewEntry((prev) => ({
                    ...prev,
                    startDate: formatDateOnlyLocal(picked),
                    endDate: formatDateOnlyLocal(picked),
                }));
            } else {
                setNewEntry((prev) => ({
                    ...prev,
                    startDate: formatDateOnlyLocal(picked),
                }));
            }
        } else {
            // Ensure end >= start
            const safeEnd = picked.getTime() < startDateObj.getTime() ? startDateObj : picked;
            setEndDateObj(safeEnd);
            setNewEntry((prev) => ({
                ...prev,
                endDate: formatDateOnlyLocal(safeEnd),
            }));
        }

        // Android closes immediately after selection
        if (Platform.OS !== 'ios') setShowPicker(false);
    };

    // ----------------------------
    // Stats
    // ----------------------------
    const stats = useMemo(() => {
        if (!Array.isArray(entries) || entries.length === 0) {
            return { avgCycle: 28, avgLength: 5, prediction: null as Date | null };
        }

        const sorted = [...entries].sort((a, b) => {
            const da = parseDateOnly(a.startDate);
            const db = parseDateOnly(b.startDate);
            return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
        });

        // Avg length
        const lengths = sorted
            .map((e) => {
                const start = parseDateOnly(e.startDate);
                const end = parseDateOnly(e.endDate || e.startDate);
                if (!start || !end) return null;

                const diffTime = Math.abs(end.getTime() - start.getTime());
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            })
            .filter((n): n is number => typeof n === 'number' && !isNaN(n));

        const avgLength =
            lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 5;

        // Avg cycle
        let avgCycle = 28;
        if (sorted.length > 1) {
            const intervals: number[] = [];
            for (let i = 1; i < sorted.length; i++) {
                const d1 = parseDateOnly(sorted[i - 1].startDate);
                const d2 = parseDateOnly(sorted[i].startDate);
                if (!d1 || !d2) continue;

                const diffTime = Math.abs(d2.getTime() - d1.getTime());
                intervals.push(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            if (intervals.length > 0) {
                avgCycle = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
            }
        }

        // Prediction
        const lastStart = parseDateOnly(sorted[sorted.length - 1].startDate);
        if (!lastStart) return { avgCycle, avgLength, prediction: null as Date | null };

        const predictionDate = new Date(lastStart);
        predictionDate.setDate(predictionDate.getDate() + avgCycle);

        return { avgCycle, avgLength, prediction: predictionDate };
    }, [entries]);

    // ----------------------------
    // Calendar
    // ----------------------------
    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days: Array<Date | null> = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    }, [viewDate]);

    const getDayStatus = (date: Date | null) => {
        if (!date) return { isToday: false, isLogged: false, isPredicted: false, flow: null as string | null };

        const dateStr = formatDateOnlyLocal(date);
        const todayStr = formatDateOnlyLocal(new Date());
        const isToday = dateStr === todayStr;

        const activeEntry = entries.find((e) => {
            const start = e.startDate;
            const end = e.endDate || e.startDate;
            return dateStr >= start && dateStr <= end;
        });

        const isLogged = !!activeEntry;
        const flow = activeEntry?.flow || null;

        let isPredicted = false;
        if (stats.prediction && !isLogged) {
            const pStartStr = formatDateOnlyLocal(stats.prediction);
            const pEnd = new Date(stats.prediction);
            pEnd.setDate(pEnd.getDate() + (stats.avgLength || 0) - 1);
            const pEndStr = formatDateOnlyLocal(pEnd);

            isPredicted = dateStr >= pStartStr && dateStr <= pEndStr;
        }

        return { isToday, isLogged, isPredicted, flow };
    };

    // ----------------------------
    // Render
    // ----------------------------
    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-rose-50">
                <ActivityIndicator size="large" color="#e11d48" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-rose-50 pt-8">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#e11d48']}
                        tintColor="#e11d48"
                    />
                }
            >
                {/* Header */}
                <View className="px-6 mb-8 flex-row justify-between items-center">
                    <View>
                        <Text className="text-4xl font-black text-rose-950 tracking-tighter">
                            Cycle <Text className="text-rose-500">Analytics</Text>
                        </Text>
                        <Text className="text-gray-500 font-medium tracking-tight">Visualize your history.</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowLogModal(true)}
                        className="bg-rose-500 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-rose-200 active:scale-95"
                    >
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-6 mb-8"
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    {[
                        {
                            label: 'Next Predicted',
                            value: stats.prediction
                                ? stats.prediction.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
                                : '---',
                            icon: 'star',
                            tag: 'Forecast',
                        },
                        { label: 'Avg Cycle', value: `${stats.avgCycle} Days`, icon: 'refresh', tag: 'Regular' },
                        { label: 'Avg Length', value: `${stats.avgLength} Days`, icon: 'time', tag: 'Duration' },
                    ].map((item, idx) => (
                        <View
                            key={idx}
                            className="bg-rose-100/30 p-6 rounded-[2.5rem] border border-rose-200/50 mr-4 w-40 h-48 justify-between"
                        >
                            <View className="items-end">
                                <Ionicons name={item.icon as any} size={24} color="#f43f5e" style={{ opacity: 0.8 }} />
                            </View>
                            <View>
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{item.label}</Text>
                                <Text className="text-2xl font-black text-rose-950">{item.value}</Text>
                            </View>
                            <View className="bg-rose-100/50 self-start px-3 py-1 rounded-full">
                                <Text className="text-[9px] font-black text-rose-500 uppercase">{item.tag}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Calendar */}
                <View className="mx-6 bg-rose-100/20 rounded-[3rem] p-6 border border-rose-200/30 mb-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-2xl font-black text-rose-950">
                                {viewDate.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                            </Text>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calendar View</Text>
                        </View>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => {
                                    const d = new Date(viewDate);
                                    d.setMonth(d.getMonth() - 1);
                                    setViewDate(d);
                                }}
                                className="w-10 h-10 bg-white/50 rounded-xl items-center justify-center border border-white/60"
                            >
                                <Ionicons name="chevron-back" size={20} color="#e11d48" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    const d = new Date(viewDate);
                                    d.setMonth(d.getMonth() + 1);
                                    setViewDate(d);
                                }}
                                className="w-10 h-10 bg-white/50 rounded-xl items-center justify-center border border-white/60"
                            >
                                <Ionicons name="chevron-forward" size={20} color="#e11d48" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Week Labels */}
                    <View className="flex-row justify-between mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <Text key={i} className="text-xs font-black text-rose-300 w-8 text-center">
                                {day}
                            </Text>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View className="flex-row flex-wrap gap-2 justify-between">
                        {calendarDays.map((date, index) => {
                            if (!date) return <View key={`empty-${index}`} className="w-10 h-12" />;

                            const { isToday, isLogged, isPredicted } = getDayStatus(date);

                            let bgClass = 'bg-white/20 border-transparent';
                            let textClass = 'text-gray-400';

                            if (isLogged) {
                                bgClass = 'bg-rose-500 border-rose-600 shadow-lg shadow-rose-200 scale-105';
                                textClass = 'text-white font-black';
                            } else if (isPredicted) {
                                bgClass = 'bg-rose-50/50 border-rose-200 border-dashed';
                                textClass = 'text-rose-400';
                            } else if (isToday) {
                                bgClass = 'bg-white border-rose-200';
                                textClass = 'text-rose-950 font-black';
                            }

                            return (
                                <View
                                    key={formatDateOnlyLocal(date)}
                                    className={`w-10 h-10 mb-2 rounded-2xl items-center justify-center border-2 ${bgClass}`}
                                >
                                    <Text className={`${textClass} text-xs`}>{date.getDate()}</Text>
                                    {isLogged && <View className="w-1 h-1 bg-white/50 rounded-full mt-1" />}
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* History */}
                <View className="px-6 mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-black text-rose-950">History</Text>
                        <View className="bg-rose-100 px-3 py-1 rounded-full">
                            <Text className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                                {entries.length} Logs
                            </Text>
                        </View>
                    </View>

                    {entries
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                            <View
                                key={`${entry.startDate}-${entry.endDate ?? entry.startDate}-${idx}`}
                                className="mb-4 bg-rose-100/10 p-5 rounded-[2rem] border border-rose-200/20 flex-row items-center"
                            >
                                <View className="w-12 h-12 bg-rose-100/50 rounded-2xl items-center justify-center mr-4">
                                    <Ionicons name="water" size={20} color="#f43f5e" />
                                </View>

                                <View>
                                    {/* ✅ dd mmm - dd mmm */}
                                    <Text className="text-rose-950 font-bold text-base">
                                        {formatDDMMMFromYMD(entry.startDate)} -{' '}
                                        {formatDDMMMFromYMD(entry.endDate || entry.startDate)}
                                    </Text>

                                    {/* <Text className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">
                                        {entry.flow || 'Medium'} Flow
                                    </Text> */}
                                </View>
                            </View>
                        ))}
                </View>
            </ScrollView>

            {/* Log Modal */}
            <Modal visible={showLogModal} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-rose-950/20">
                    <View className="bg-white rounded-t-[3rem] p-8 pb-12 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-3xl font-black text-rose-950 tracking-tighter">
                                Log <Text className="text-rose-500">Cycle</Text>
                            </Text>

                            <TouchableOpacity
                                onPress={() => setShowLogModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color="gray" />
                            </TouchableOpacity>
                        </View>

                        {/* Date Buttons (Open inline picker) */}
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1 space-y-2">
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                                    Start Date
                                </Text>
                                <TouchableOpacity
                                    onPress={() => openPicker('start')}
                                    activeOpacity={0.85}
                                    className={`bg-gray-50 p-4 rounded-2xl border ${pickerTarget === 'start' && showPicker ? 'border-rose-300' : 'border-gray-100'
                                        }`}
                                >
                                    <Text className="font-bold text-rose-950">{formatDDMMMFromDate(startDateObj)}</Text>
                                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Tap to select
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 space-y-2">
                                <Text className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">
                                    End Date
                                </Text>
                                <TouchableOpacity
                                    onPress={() => openPicker('end')}
                                    activeOpacity={0.85}
                                    className={`bg-gray-50 p-4 rounded-2xl border ${pickerTarget === 'end' && showPicker ? 'border-rose-300' : 'border-gray-100'
                                        }`}
                                >
                                    <Text className="font-bold text-rose-950">{formatDDMMMFromDate(endDateObj)}</Text>
                                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                        Tap to select
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* ✅ Inline Picker */}
                        {showPicker && (
                            <View className="mb-6 bg-gray-50 rounded-2xl border border-gray-100 p-2">
                                <DateTimePicker
                                    value={pickerTarget === 'start' ? startDateObj : endDateObj}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onChangePicker}
                                    minimumDate={pickerTarget === 'end' ? startDateObj : undefined}
                                />

                                {/* iOS: show a Done button to close inline spinner */}
                                {Platform.OS === 'ios' && (
                                    <TouchableOpacity
                                        onPress={() => setShowPicker(false)}
                                        className="mt-3 bg-white py-3 rounded-2xl items-center border border-gray-100"
                                    >
                                        <Text className="font-black text-rose-600 uppercase tracking-widest">Done</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Confirm */}
                        <TouchableOpacity
                            onPress={handleSaveEntry}
                            className="w-full bg-rose-500 py-5 rounded-[2rem] items-center shadow-xl shadow-rose-200"
                        >
                            <Text className="font-black text-white text-lg uppercase tracking-widest">
                                Confirm Log
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default TrackerScreen;
