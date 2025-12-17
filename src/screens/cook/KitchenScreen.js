import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../../config/firebase';

export default function KitchenScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Kitchen Display</Text>
            <Text style={styles.subtitle}>View & Update Orders</Text>
            <Button title="Logout" onPress={() => auth.signOut()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, marginBottom: 20, color: '#666' }
});
