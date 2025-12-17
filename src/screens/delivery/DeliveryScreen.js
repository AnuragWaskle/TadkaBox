import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar, Linking, Platform, Modal, Dimensions, TextInput, KeyboardAvoidingView } from 'react-native';
import { auth, db } from '../../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function DeliveryScreen() {
    const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'history'
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeOrders, setActiveOrders] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); // For map modal
    const [earnings, setEarnings] = useState(0);

    // OTP State
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [verifyingOrder, setVerifyingOrder] = useState(null);

    const user = auth.currentUser;

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);
        })();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Query for Available Orders (Ready for Pickup)
        const availableQ = query(
            collection(db, 'orders'),
            where('status', '==', 'READY_FOR_PICKUP')
        );

        // Query for My Active Deliveries
        const activeQ = query(
            collection(db, 'orders'),
            where('status', '==', 'OUT_FOR_DELIVERY'),
            where('deliveryBoyId', '==', user.uid)
        );

        // Query for My History (Delivered)
        const historyQ = query(
            collection(db, 'orders'),
            where('status', '==', 'DELIVERED'),
            where('deliveryBoyId', '==', user.uid)
        );

        const unsubAvailable = onSnapshot(availableQ, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort
            orders.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setAvailableOrders(orders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching available orders:", error);
            // Alert.alert("Error", "Could not fetch available orders. Check console.");
        });

        const unsubActive = onSnapshot(activeQ, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort
            orders.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setActiveOrders(orders);
        }, (error) => {
            console.error("Error fetching active orders:", error);
        });

        const unsubHistory = onSnapshot(historyQ, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort
            orders.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
            setHistoryOrders(orders);
            // Calculate earnings (mock calculation: 10% of total)
            const total = orders.reduce((sum, order) => sum + (order.totalAmount * 0.10), 0);
            setEarnings(total);
        }, (error) => {
            console.error("Error fetching history orders:", error);
        });

        return () => {
            unsubAvailable();
            unsubActive();
            unsubHistory();
        };
    }, [user]);

    const handlePickUp = async (orderId) => {
        try {
            // Generate 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
                status: 'OUT_FOR_DELIVERY',
                deliveryBoyId: user.uid,
                pickedUpAt: new Date(),
                deliveryOtp: otp // Store OTP in Firestore
            });
            Alert.alert('Success', 'Order picked up! OTP generated for customer.');
            setActiveTab('active');
        } catch (error) {
            console.error("Error picking up order:", error);
            Alert.alert('Error', 'Failed to pick up order. Please try again.');
        }
    };

    const initiateDeliveryCompletion = (order) => {
        setVerifyingOrder(order);
        setOtpInput('');
        setOtpModalVisible(true);
    };

    const verifyAndCompleteDelivery = async () => {
        if (!verifyingOrder) return;

        if (otpInput !== verifyingOrder.deliveryOtp) {
            Alert.alert("Invalid OTP", "The OTP you entered is incorrect. Please ask the customer for the correct code.");
            return;
        }

        try {
            const orderRef = doc(db, 'orders', verifyingOrder.id);
            await updateDoc(orderRef, {
                status: 'DELIVERED',
                deliveredAt: new Date()
            });
            Alert.alert('Success', 'Order delivered successfully! Great job.');
            setOtpModalVisible(false);
            setVerifyingOrder(null);
            setSelectedOrder(null); // Close map modal if open
        } catch (error) {
            console.error("Error completing delivery:", error);
            Alert.alert('Error', 'Failed to complete delivery. Please try again.');
        }
    };

    const openMaps = (address) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${0},${0} `; // Ideally, we'd have coordinates. For now, we search by address.
        const label = 'Delivery Location';
        const url = Platform.select({
            ios: `${scheme}${label} @${latLng} `,
            android: `${scheme}${address} `
        });
        Linking.openURL(url);
    };

    const callCustomer = (phone) => {
        if (!phone) {
            Alert.alert("No Phone", "Customer phone number not available.");
            return;
        }
        Linking.openURL(`tel:${phone} `);
    };

    const renderOrderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => activeTab === 'active' ? setSelectedOrder(item) : null}
            activeOpacity={activeTab === 'active' ? 0.8 : 1}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.timestamp}>
                        {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: activeTab === 'available' ? '#E0F2F1' : activeTab === 'active' ? '#FFF3E0' : '#E8F5E9' }]}>
                    <Text style={[styles.statusText, { color: activeTab === 'available' ? '#00695C' : activeTab === 'active' ? '#E65100' : '#2E7D32' }]}>
                        {activeTab === 'available' ? 'READY' : activeTab === 'active' ? 'ON ROUTE' : 'DELIVERED'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <Text style={styles.customerName}>Customer: {item.userId ? `User ${item.userId.slice(0, 4)} ` : 'Guest'}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.address} numberOfLines={2}>
                        {item.address || "123 Main Street, City Center, New York, NY 10001"}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="fast-food-outline" size={20} color="#666" />
                    <Text style={styles.itemsText} numberOfLines={1}>
                        {item.items.map(i => `${i.quantity}x ${i.name} `).join(', ')}
                    </Text>
                </View>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>₹{item.totalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {activeTab === 'available' && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => handlePickUp(item.id)}
                >
                    <Text style={styles.actionButtonText}>PICK UP ORDER</Text>
                    <Ionicons name="bicycle" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            {activeTab === 'active' && (
                <View>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50', marginTop: 12 }]}
                        onPress={() => initiateDeliveryCompletion(item)}
                    >
                        <Text style={styles.actionButtonText}>MARK AS DELIVERED</Text>
                        <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.tapHint}>
                        <Text style={styles.tapHintText}>Tap card for Map & Details</Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Delivery Dashboard</Text>
                    <View style={styles.earningsBadge}>
                        <Ionicons name="wallet-outline" size={16} color="#fff" />
                        <Text style={styles.earningsText}>₹{earnings.toFixed(2)} Earned</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3D00" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {['available', 'active', 'history'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                                tab === 'available' ? availableOrders.length :
                                    tab === 'active' ? activeOrders.length :
                                        historyOrders.length
                            })
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <FlatList
                data={activeTab === 'available' ? availableOrders : activeTab === 'active' ? activeOrders : historyOrders}
                renderItem={renderOrderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name={activeTab === 'available' ? "cube-outline" : activeTab === 'active' ? "bicycle-outline" : "time-outline"} size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            {activeTab === 'available' ? "No orders ready" : activeTab === 'active' ? "No active deliveries" : "No history yet"}
                        </Text>
                    </View>
                }
            />

            {/* Active Order Modal with Map */}
            <Modal
                visible={!!selectedOrder}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedOrder(null)}
            >
                {selectedOrder && (
                    <View style={styles.modalContainer}>
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                initialRegion={{
                                    latitude: location?.latitude || 37.78825,
                                    longitude: location?.longitude || -122.4324,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                showsUserLocation={true}
                            >
                                {/* Destination Marker (Mock coords if not real) */}
                                <Marker
                                    coordinate={{
                                        latitude: location?.latitude ? location.latitude + 0.01 : 37.79,
                                        longitude: location?.longitude ? location.longitude + 0.01 : -122.42
                                    }}
                                    title="Customer Location"
                                    description={selectedOrder.address}
                                />
                            </MapView>
                            <TouchableOpacity style={styles.closeModalButton} onPress={() => setSelectedOrder(null)}>
                                <Ionicons name="close-circle" size={36} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Order #{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>ON ROUTE</Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                            <Text style={styles.modalAddress}>{selectedOrder.address || "No address provided"}</Text>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.directionsBtn]}
                                    onPress={() => openMaps(selectedOrder.address)}
                                >
                                    <Ionicons name="navigate" size={20} color="#fff" />
                                    <Text style={styles.modalBtnText}>Directions</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.callBtn]}
                                    onPress={() => callCustomer(selectedOrder.phone)}
                                >
                                    <Ionicons name="call" size={20} color="#fff" />
                                    <Text style={styles.modalBtnText}>Call</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.sectionTitle}>Order Items</Text>
                            {selectedOrder.items.map((item, index) => (
                                <View key={index} style={styles.modalItemRow}>
                                    <Text style={styles.modalItemQty}>{item.quantity}x</Text>
                                    <Text style={styles.modalItemName}>{item.name}</Text>
                                    <Text style={styles.modalItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}

                            <View style={styles.modalTotalRow}>
                                <Text style={styles.modalTotalLabel}>Total to Collect</Text>
                                <Text style={styles.modalTotalAmount}>₹{selectedOrder.totalAmount.toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.completeDeliveryBtn}
                                onPress={() => initiateDeliveryCompletion(selectedOrder)}
                            >
                                <Text style={styles.completeDeliveryText}>MARK AS DELIVERED</Text>
                                <Ionicons name="shield-checkmark" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Modal>

            {/* OTP Verification Modal */}
            <Modal
                visible={otpModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setOtpModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.otpModalOverlay}>
                    <View style={styles.otpModalContainer}>
                        <Text style={styles.otpModalTitle}>Verify Delivery</Text>
                        <Text style={styles.otpModalSubtitle}>Ask the customer for the 4-digit OTP code to complete this delivery.</Text>

                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter OTP"
                            keyboardType="number-pad"
                            maxLength={4}
                            value={otpInput}
                            onChangeText={setOtpInput}
                            autoFocus={true}
                        />

                        <View style={styles.otpModalButtons}>
                            <TouchableOpacity
                                style={[styles.otpModalBtn, styles.otpCancelBtn]}
                                onPress={() => setOtpModalVisible(false)}
                            >
                                <Text style={styles.otpCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.otpModalBtn, styles.otpConfirmBtn]}
                                onPress={verifyAndCompleteDelivery}
                            >
                                <Text style={styles.otpConfirmText}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    earningsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
        alignSelf: 'flex-start',
        gap: 6
    },
    earningsText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    logoutButton: {
        padding: 8,
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#fff',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    cardBody: {
        gap: 12,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    customerName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    address: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        lineHeight: 20,
    },
    itemsText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tapHint: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 4
    },
    tapHintText: {
        color: '#999',
        fontSize: 12,
        fontWeight: '500'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        height: height * 0.4,
        width: '100%',
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    closeModalButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
    },
    modalContent: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#999',
        // uppercase: 'uppercase', // This is not a valid style property in React Native
        marginBottom: 8,
        letterSpacing: 1,
    },
    modalAddress: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginBottom: 24,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    modalBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    directionsBtn: {
        backgroundColor: '#2196F3',
    },
    callBtn: {
        backgroundColor: '#4CAF50',
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    modalItemQty: {
        fontWeight: 'bold',
        color: COLORS.primary,
        width: 30,
    },
    modalItemName: {
        flex: 1,
        color: '#333',
        fontSize: 16,
    },
    modalItemPrice: {
        fontWeight: 'bold',
        color: '#333',
    },
    modalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginBottom: 32,
    },
    modalTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalTotalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    completeDeliveryBtn: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 12,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    completeDeliveryText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // OTP Modal Styles
    otpModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    otpModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        elevation: 5,
    },
    otpModalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    otpModalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    otpInput: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    otpModalButtons: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    otpModalBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    otpCancelBtn: {
        backgroundColor: '#FFEBEE',
    },
    otpConfirmBtn: {
        backgroundColor: COLORS.primary,
    },
    otpCancelText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
    },
    otpConfirmText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

