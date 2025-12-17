import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    FlatList,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const CATEGORIES = [
    { id: '1', name: 'Starters', icon: '🍢' },
    { id: '2', name: 'Main Course', icon: '🍛' },
    { id: '3', name: 'South Indian', icon: '🥘' },
    { id: '4', name: 'Fast Food', icon: '🍔' },
    { id: '5', name: 'Dessert', icon: '🍰' },
    { id: '6', name: 'Drinks', icon: '🥤' },
];

const FEATURED_ITEMS = [
    {
        id: '1',
        name: 'Double Cheeseburger',
        price: 12.99,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
    },
    {
        id: '2',
        name: 'Pepperoni Pizza',
        price: 15.49,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
    },
    {
        id: '3',
        name: 'Sushi Platter',
        price: 22.99,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
    }
];

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [featuredItems, setFeaturedItems] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Listen for active orders
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('status', '==', 'OUT_FOR_DELIVERY')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const activeDeliveries = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(activeDeliveries);
        });

        // Fetch Featured Items from Menu
        const fetchFeatured = async () => {
            try {
                const menuQ = query(collection(db, 'menuItems'));
                const unsubscribeMenu = onSnapshot(menuQ, (snapshot) => {
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Randomly select or just take first 5 as featured for now
                    setFeaturedItems(items.slice(0, 5));
                });
                return () => unsubscribeMenu();
            } catch (error) {
                console.error("Error fetching menu:", error);
            }
        };
        fetchFeatured();

        return () => unsubscribe();
    }, [user]);

    const renderCategory = ({ item }) => (
        <TouchableOpacity style={styles.categoryCard} onPress={() => navigation.navigate('Menu', { category: item.name })}>
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderFeaturedItem = ({ item }) => (
        <TouchableOpacity style={styles.featuredCard} onPress={() => navigation.navigate('Menu')}>
            <Image source={{ uri: item.imageUrl || item.image }} style={styles.featuredImage} />
            <View style={styles.featuredInfo}>
                <View>
                    <Text style={styles.featuredName}>{item.name}</Text>
                    <Text style={styles.featuredRating}>⭐ {item.rating || '4.5'}</Text>
                </View>
                <Text style={styles.featuredPrice}>₹{item.price}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'Foodie'}!</Text>
                        <Text style={styles.subtitle}>Hungry? Let's eat.</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={() => setModalVisible(true)}
                        >
                            <Ionicons name="notifications-outline" size={24} color={COLORS.dark} />
                            {notifications.length > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{notifications.length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                            <Image
                                source={{ uri: 'https://ui-avatars.com/api/?background=FA4A0C&color=fff&name=' + (user?.displayName || 'User') }}
                                style={styles.profileImage}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={24} color={COLORS.dark} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search for delicious food..."
                        style={styles.searchInput}
                        placeholderTextColor={COLORS.gray}
                    />
                </View>

                {/* Categories */}
                <View style={styles.section}>
                    <FlatList
                        data={CATEGORIES}
                        renderItem={renderCategory}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                {/* Featured Banner (Promo) */}
                <View style={styles.bannerContainer}>
                    <View style={styles.banner}>
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>Special Deal</Text>
                            <Text style={styles.bannerText}>Get 50% OFF on your first order!</Text>
                            <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('Menu')}>
                                <Text style={styles.bannerButtonText}>Order Now</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' }}
                            style={styles.bannerImage}
                        />
                    </View>
                </View>

                {/* Featured Items */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Popular Now</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
                            <Text style={styles.seeAll}>See more</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={featuredItems}
                        renderItem={renderFeaturedItem}
                        keyExtractor={item => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredList}
                    />
                </View>
            </ScrollView>

            {/* Notification Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={COLORS.dark} />
                            </TouchableOpacity>
                        </View>

                        {notifications.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray} />
                                <Text style={styles.emptyStateText}>No new notifications</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={notifications}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <View style={styles.notificationCard}>
                                        <View style={styles.notificationHeader}>
                                            <Text style={styles.notificationTitle}>Order Arriving!</Text>
                                            <Text style={styles.notificationTime}>Now</Text>
                                        </View>
                                        <Text style={styles.notificationBody}>
                                            Your order #{item.id.slice(-6).toUpperCase()} is out for delivery.
                                        </Text>
                                        <View style={styles.otpContainer}>
                                            <Text style={styles.otpLabel}>SHARE THIS OTP WITH DRIVER:</Text>
                                            <Text style={styles.otpCode}>{item.deliveryOtp}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.light },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        marginBottom: SPACING.l,
        marginTop: 10, // Added margin for visibility
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    notificationButton: {
        position: 'relative',
        padding: 4,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: COLORS.error,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.light,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    greeting: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark },
    subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 4 },
    profileButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        ...SHADOWS.light,
    },
    profileImage: { width: '100%', height: '100%', borderRadius: 25 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFEEEE',
        marginHorizontal: SPACING.l,
        borderRadius: 30,
        paddingHorizontal: SPACING.m,
        height: 50,
        marginBottom: SPACING.l,
    },
    searchIcon: { marginRight: SPACING.s },
    searchInput: { flex: 1, fontSize: 16, color: COLORS.dark },
    section: { marginBottom: SPACING.xl },
    categoriesList: { paddingHorizontal: SPACING.l, gap: SPACING.m },
    categoryCard: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.l,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
        flexDirection: 'row',
        gap: 8,
    },
    categoryIcon: { fontSize: 20 },
    categoryName: { fontSize: 14, fontWeight: 'bold', color: COLORS.dark },
    bannerContainer: { paddingHorizontal: SPACING.l, marginBottom: SPACING.xl },
    banner: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: SPACING.l,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.dark,
        height: 160,
    },
    bannerContent: { flex: 1 },
    bannerTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.white, marginBottom: 4 },
    bannerText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: SPACING.m },
    bannerButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.l,
        paddingVertical: 10,
        borderRadius: 30,
        alignSelf: 'flex-start',
    },
    bannerButtonText: { color: COLORS.primary, fontWeight: 'bold' },
    bannerImage: { width: 120, height: 120, resizeMode: 'contain', transform: [{ rotate: '-15deg' }], position: 'absolute', right: -10, bottom: -10 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.dark },
    seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
    featuredList: { paddingHorizontal: SPACING.l, gap: SPACING.l },
    featuredCard: {
        backgroundColor: COLORS.white,
        borderRadius: 25,
        width: 220,
        height: 280,
        ...SHADOWS.medium,
        padding: SPACING.m,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    featuredImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
        marginTop: -SPACING.l,
        ...SHADOWS.medium,
    },
    featuredInfo: { alignItems: 'center', marginTop: SPACING.m, width: '100%' },
    featuredName: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, textAlign: 'center', marginBottom: 4 },
    featuredRating: { fontSize: 14, color: COLORS.warning, fontWeight: 'bold', marginBottom: 8 },
    featuredPrice: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.light,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.l,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.dark,
    },
    emptyState: {
        alignItems: 'center',
        padding: SPACING.xl,
        gap: SPACING.m,
    },
    emptyStateText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
    notificationCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 16,
        marginBottom: SPACING.m,
        ...SHADOWS.light,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    notificationTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.dark,
    },
    notificationTime: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    notificationBody: {
        color: COLORS.text,
        marginBottom: 12,
        lineHeight: 20,
    },
    otpContainer: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#90CAF9',
        borderStyle: 'dashed',
    },
    otpLabel: {
        fontSize: 12,
        color: '#1565C0',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    otpCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1565C0',
        letterSpacing: 4,
    }
});
