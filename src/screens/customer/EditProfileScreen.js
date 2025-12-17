import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

export default function EditProfileScreen({ navigation }) {
    const { user } = useAuth();
    const [name, setName] = useState(user?.displayName || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }
        setLoading(true);
        try {
            // Update Auth Profile
            await updateProfile(auth.currentUser, { displayName: name });

            // Update Firestore
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { fullName: name });

            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", error.message);
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
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: '#f0f0f0', color: '#999' }]}
                    value={user?.email}
                    editable={false}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading}>
                    <Text style={styles.saveButtonText}>{loading ? "Updating..." : "Save Changes"}</Text>
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
    form: { padding: SPACING.l },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s },
    input: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SPACING.m,
        ...SHADOWS.medium
    },
    saveButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' }
});
