import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { subscribeToOrders } from '../../services/OrderService';

export default function OrderHistoryScreen({ navigation }) {
    const { user, userRole } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToOrders(userRole, user.uid, (updatedOrders) => {
            setOrders(updatedOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userRole]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED': return COLORS.warning;
            case 'PREPARING': return COLORS.info;
            case 'READY': return COLORS.primary;
            case 'OUT_FOR_DELIVERY': return COLORS.secondary;
            case 'DELIVERED': return COLORS.success;
            case 'CANCELLED': return COLORS.error;
            default: return COLORS.gray;
        }
    };

    const renderOrder = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderDate}>
                        {item.createdAt?.toDate ? item.createdAt.toDate().toDateString() : 'Just now'}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemsList}>
                {item.items.map((food, index) => (
                    <Text key={index} style={styles.itemText}>
                        {food.quantity}x {food.name}
                    </Text>
                ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{item.totalAmount.toFixed(2)}</Text>
                </View>
                {item.status === 'OUT_FOR_DELIVERY' && item.deliveryOtp && (
                    <View style={styles.otpContainer}>
                        <Text style={styles.otpLabel}>Delivery OTP</Text>
                        <Text style={styles.otpValue}>{item.deliveryOtp}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={100} color={COLORS.gray} />
                    <Text style={styles.emptyText}>No orders yet</Text>
                    <Text style={styles.emptySubText}>When you place an order, it will appear here.</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Menu')}>
                        <Text style={styles.browseButtonText}>Browse Menu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.light },
    header: {
        paddingVertical: SPACING.m,
        alignItems: 'center',
        backgroundColor: COLORS.light,
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
    listContent: { padding: SPACING.l, paddingBottom: 100 },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.l,
        marginBottom: SPACING.l,
        ...SHADOWS.medium,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.m,
    },
    orderId: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
    orderDate: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: SPACING.m },
    itemsList: { gap: 8 },
    itemText: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.s,
    },
    totalLabel: { fontSize: 16, color: COLORS.textLight },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyText: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginTop: SPACING.l },
    emptySubText: { fontSize: 16, color: COLORS.textLight, marginTop: 8, textAlign: 'center', marginBottom: SPACING.xl },
    browseButton: {
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.l,
        backgroundColor: COLORS.dark,
        borderRadius: 20,
    },
    browseButtonText: { color: COLORS.white, fontWeight: '600' },
    otpContainer: {
        alignItems: 'flex-end',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#90CAF9',
    },
    otpLabel: {
        fontSize: 10,
        color: '#1976D2',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    otpValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1565C0',
        letterSpacing: 2,
    }
});
