import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ScrollView
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { placeOrder } from '../../services/OrderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutScreen({ navigation }) {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    const totalAmount = getCartTotal();

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Create order in Firestore
            await placeOrder(user.uid, cartItems, totalAmount);

            // Clear Cart
            clearCart();

            Alert.alert("Success!", "Your order has been placed.", [
                { text: "OK", onPress: () => navigation.navigate('Orders') }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const PaymentOption = ({ id, label, icon }) => (
        <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === id && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod(id)}
        >
            <Ionicons name={icon} size={24} color={paymentMethod === id ? COLORS.primary : COLORS.gray} />
            <Text style={[styles.paymentText, paymentMethod === id && styles.paymentTextActive]}>{label}</Text>
            {paymentMethod === id && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Payment Method</Text>

                <PaymentOption id="CARD" label="Credit/Debit Card" icon="card" />
                <PaymentOption id="UPI" label="UPI / Wallet" icon="wallet" />
                <PaymentOption id="COD" label="Cash on Delivery" icon="cash" />

                <View style={styles.summaryContainer}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        <Text style={styles.summaryValue}>₹2.00</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{(totalAmount + 2).toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text style={styles.payButtonText}>
                        {loading ? "Processing..." : `Pay ₹${(totalAmount + 2).toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.light },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.dark },
    content: { padding: SPACING.l },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: SPACING.m },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 12,
    },
    paymentOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#FFF5F5',
    },
    paymentText: { fontSize: 16, color: COLORS.text, flex: 1 },
    paymentTextActive: { color: COLORS.primary, fontWeight: '600' },
    summaryContainer: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderRadius: 12,
        ...SHADOWS.light,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.s,
    },
    summaryLabel: { color: COLORS.textLight, fontSize: 16 },
    summaryValue: { color: COLORS.dark, fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: SPACING.s },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    footer: {
        padding: SPACING.l,
        backgroundColor: COLORS.white,
        ...SHADOWS.medium,
    },
    payButton: {
        backgroundColor: COLORS.success,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    payButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});
