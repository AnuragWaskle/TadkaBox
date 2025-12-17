import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { MotiView } from 'moti';

export default function LoginScreen({ navigation }) {
    // Temporary hardcoded credentials for easy testing
    const [email, setEmail] = useState('customer@foodapp.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            Alert.alert("Login Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <MotiView
                from={{ opacity: 0, translateY: 50 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 1000 }}
                style={styles.innerContainer}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.logoText}>🍔 Foodie</Text>
                    <Text style={styles.subtitle}>Delicious food delivered to you.</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                        placeholderTextColor={COLORS.gray}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        secureTextEntry
                        placeholderTextColor={COLORS.gray}
                    />

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? "Signing In..." : "Login"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
                        <Text style={styles.linkText}>New here? <Text style={{ fontWeight: 'bold' }}>Create Account</Text></Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={async () => {
                            const { seedTestUsers } = require('../../utils/seedUsers');
                            Alert.alert("Seeding Database", "Creating test users...");
                            const res = await seedTestUsers();
                            Alert.alert("Result", res);
                        }}
                        style={{ marginTop: 20, alignItems: 'center' }}
                    >
                        <Text style={{ color: COLORS.gray, fontSize: 12 }}>🛠 Seed Test Users (Dev Only)</Text>
                    </TouchableOpacity>
                </View>
            </MotiView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.light
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.l,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl * 1.5,
    },
    logoText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.s,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        padding: SPACING.l,
        borderRadius: 20,
        ...SHADOWS.medium,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.s,
        marginLeft: SPACING.s,
    },
    input: {
        backgroundColor: COLORS.light,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee'
    },
    loginButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: SPACING.s,
        ...SHADOWS.light,
    },
    loginButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        marginTop: SPACING.l,
        alignItems: 'center'
    },
    linkText: {
        color: COLORS.textLight,
        fontSize: 14
    }
});
