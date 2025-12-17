import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';

export default function MenuScreen({ navigation, route }) {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animatingItem, setAnimatingItem] = useState(null);
    const { category } = route.params || {};
    const { addToCart, getCartCount } = useCart();

    useEffect(() => {
        setLoading(true);
        let q;
        if (category) {
            // Note: Ensure you have an index for 'category' if this query fails, or filter client-side if dataset is small.
            // For now, let's fetch all and filter client side to avoid index issues during demo.
            q = query(collection(db, 'menuItems'));
        } else {
            q = query(collection(db, 'menuItems'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (category) {
                items = items.filter(item => item.category === category || item.category?.toLowerCase() === category.toLowerCase());
            }

            setMenuItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching menu:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [category]);

    const handleAddToCart = (item) => {
        setAnimatingItem(item.id);
        addToCart(item);
        setTimeout(() => setAnimatingItem(null), 200);
    };

    const renderItem = ({ item, index }) => (
        <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 100 }}
            style={styles.card}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.8}
                >
                    <MotiView
                        from={{ scale: 1 }}
                        animate={{ scale: animatingItem === item.id ? 0.9 : 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                        <Text style={styles.addButtonText}>Add to Cart</Text>
                        <Ionicons name="cart-outline" size={20} color={COLORS.white} />
                    </MotiView>
                </TouchableOpacity>
            </View>
        </MotiView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category || 'Menu'}</Text>
                <TouchableOpacity style={styles.cartIcon} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={24} color={COLORS.dark} />
                    {getCartCount() > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{getCartCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={menuItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.light,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.light,
        marginTop: 10, // Added margin for visibility
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        ...SHADOWS.light,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    cartIcon: {
        padding: 8,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        ...SHADOWS.light,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    listContent: {
        padding: SPACING.l,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 24,
        marginBottom: SPACING.l,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    imageContainer: {
        height: 200,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    priceTag: {
        position: 'absolute',
        top: SPACING.m,
        right: SPACING.m,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: 20,
        ...SHADOWS.light,
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cardContent: {
        padding: SPACING.l,
    },
    itemName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: SPACING.l,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
        ...SHADOWS.light,
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    }
});
