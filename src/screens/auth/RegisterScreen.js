import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Create user document with role
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                role: 'CUSTOMER',
                createdAt: new Date()
            });
            // Navigation will be handled by AuthContext state change
        } catch (error) {
            Alert.alert("Registration Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />



            <Button title="Sign Up" onPress={handleRegister} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 28, marginBottom: 30, textAlign: 'center', fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, marginBottom: 15, borderRadius: 8, fontSize: 16 },
    label: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
    roleContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    roleButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, minWidth: '40%', alignItems: 'center' },
    roleButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    roleText: { color: '#333' },
    roleTextActive: { color: '#fff' },
    link: { marginTop: 20, alignItems: 'center' },
    linkText: { color: 'blue' }
});
