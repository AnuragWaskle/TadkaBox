import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function AddressScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const getLocation = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            // Reverse Geocode
            let addressResponse = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (addressResponse.length > 0) {
                const addr = addressResponse[0];
                setAddress(`₹{addr.street || ''} ₹{addr.name || ''}, ₹{addr.city}, ₹{addr.region}`);
            }

        } catch (error) {
            setErrorMsg('Error fetching location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Addresses</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.mapPlaceholder}>
                    <Ionicons name="map" size={60} color={COLORS.primary} />
                    <Text style={styles.mapText}>Map View Placeholder</Text>
                    <Text style={styles.mapSubText}>(Requires Google Maps API Key for full map)</Text>
                </View>

                <TouchableOpacity style={styles.locateButton} onPress={getLocation} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Ionicons name="locate" size={20} color={COLORS.white} />
                            <Text style={styles.locateButtonText}>Use Current Location</Text>
                        </>
                    )}
                </TouchableOpacity>

                {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

                {location && (
                    <View style={styles.addressCard}>
                        <Text style={styles.addressLabel}>Detected Location:</Text>
                        <Text style={styles.coords}>Lat: {location.coords.latitude.toFixed(4)}, Long: {location.coords.longitude.toFixed(4)}</Text>
                        {address && <Text style={styles.addressText}>{address}</Text>}
                    </View>
                )}
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
    content: { padding: SPACING.l, alignItems: 'center' },
    mapPlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    mapText: { fontSize: 18, fontWeight: 'bold', color: COLORS.gray, marginTop: 10 },
    mapSubText: { fontSize: 12, color: COLORS.gray },
    locateButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        ...SHADOWS.medium,
    },
    locateButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    errorText: { color: COLORS.error, marginTop: SPACING.m },
    addressCard: {
        marginTop: SPACING.l,
        padding: SPACING.m,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        width: '100%',
        ...SHADOWS.light,
    },
    addressLabel: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
    coords: { fontSize: 12, color: COLORS.gray, marginBottom: 8 },
    addressText: { fontSize: 16, fontWeight: '600', color: COLORS.dark },
});
