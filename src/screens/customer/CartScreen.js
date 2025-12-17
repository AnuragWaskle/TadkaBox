import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

export default function CartScreen({ navigation }) {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const totalAmount = getCartTotal();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert("Cart Empty", "Add some delicious food first!");
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderItem = ({ item }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyButton}>
                    <Ionicons name="remove" size={20} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyButton}>
                    <Ionicons name="add" size={20} color={COLORS.dark} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={100} color={COLORS.gray} />
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <Text style={styles.emptySubText}>Looks like you haven't added anything yet.</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Menu')}>
                        <Text style={styles.browseButtonText}>Start Ordering</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutText}>Checkout</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
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
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 20,
        marginBottom: SPACING.m,
        ...SHADOWS.light,
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
    itemPrice: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.light,
        borderRadius: 12,
        padding: 4,
        marginHorizontal: SPACING.m,
    },
    qtyButton: {
        padding: 8,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        ...SHADOWS.light,
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderRadius: 30,
        ...SHADOWS.dark,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    totalLabel: { fontSize: 18, color: COLORS.textLight, fontWeight: '600' },
    totalAmount: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark },
    checkoutButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 8,
        ...SHADOWS.medium,
    },
    checkoutText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyText: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginTop: SPACING.l },
    emptySubText: { fontSize: 16, color: COLORS.textLight, marginTop: 8, textAlign: 'center', marginBottom: SPACING.xl },
    browseButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        backgroundColor: COLORS.primary,
        borderRadius: 30,
        ...SHADOWS.medium,
    },
    browseButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});
