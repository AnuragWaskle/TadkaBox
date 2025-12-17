import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';
import { signOut } from 'firebase/auth';

export default function ProfileScreen({ navigation }) {
    const { user, userRole } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            Alert.alert("Error", "Failed to log out");
        }
    };

    const MenuItem = ({ icon, label, onPress, isDestructive = false }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIcon]}>
                <Ionicons name={icon} size={22} color={isDestructive ? COLORS.error : COLORS.primary} />
            </View>
            <Text style={[styles.menuLabel, isDestructive && styles.destructiveLabel]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                </View>

                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?background=FA4A0C&color=fff&size=150&name=' + (user?.displayName || 'User') }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>{user?.displayName || 'Foodie User'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{userRole}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => navigation.navigate('EditProfile')}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="location-outline"
                            label="Manage Addresses"
                            onPress={() => navigation.navigate('Address')}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="notifications-outline"
                            label="Notifications"
                            onPress={() => Alert.alert("Coming Soon", "Notification settings coming soon!")}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <View style={styles.menuContainer}>
                        <MenuItem
                            icon="help-circle-outline"
                            label="Help & Support"
                            onPress={() => Alert.alert("Support", "Contact us at support@tadkabox.com")}
                        />
                        <View style={styles.divider} />
                        <MenuItem
                            icon="log-out-outline"
                            label="Logout"
                            onPress={handleLogout}
                            isDestructive
                        />
                    </View>
                </View>
            </ScrollView>
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
    profileCard: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SPACING.m,
        borderWidth: 4,
        borderColor: COLORS.white,
        ...SHADOWS.medium,
    },
    userName: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark, marginBottom: 4 },
    userEmail: { fontSize: 16, color: COLORS.textLight, marginBottom: SPACING.m },
    roleBadge: {
        backgroundColor: '#FFF5F5',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFE3E3',
    },
    roleText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
    section: { marginBottom: SPACING.l, paddingHorizontal: SPACING.l },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark, marginBottom: SPACING.s, marginLeft: 4 },
    menuContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: SPACING.s,
        ...SHADOWS.light,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    destructiveIcon: { backgroundColor: '#FFF5F5' },
    menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.dark },
    destructiveLabel: { color: COLORS.error },
    divider: { height: 1, backgroundColor: '#F5F5F8', marginLeft: 64 },
});
