import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage Menu & Staff</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AddMenuItem')}
            >
                <Text style={styles.buttonText}>+ Add Menu Item</Text>
            </TouchableOpacity>

            <Button title="Logout" onPress={() => auth.signOut()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, marginBottom: 20, color: '#666' },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
