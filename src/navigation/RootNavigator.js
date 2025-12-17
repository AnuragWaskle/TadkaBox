import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import DashboardScreen from '../screens/admin/DashboardScreen';
import KitchenScreen from '../screens/cook/KitchenScreen';
import DeliveryScreen from '../screens/delivery/DeliveryScreen';
import MenuScreen from '../screens/customer/MenuScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import AddMenuItemScreen from '../screens/admin/AddMenuItemScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

import CustomerTabNavigator from './CustomerTabNavigator';
import AddressScreen from '../screens/customer/AddressScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';

function CustomerStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={CustomerTabNavigator} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    );
}

function AdminStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
        </Stack.Navigator>
    );
}

function CookStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Kitchen" component={KitchenScreen} />
        </Stack.Navigator>
    );
}

function DeliveryStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Delivery" component={DeliveryScreen} />
        </Stack.Navigator>
    );
}

export default function RootNavigator() {
    const { user, userRole, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {!user ? (
                <AuthStack />
            ) : (
                <>
                    {userRole === 'CUSTOMER' && <CustomerStack />}
                    {userRole === 'DELIVERY' && <DeliveryStack />}

                    {(userRole === 'ADMIN' || userRole === 'COOK') && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
                                {userRole} Dashboard
                            </Text>
                            <Text style={{ textAlign: 'center', color: 'gray' }}>
                                Please use the Web Portal to access the {userRole.toLowerCase()} dashboard.
                            </Text>
                            <Text style={{ marginTop: 20, color: 'blue' }} onPress={() => auth.signOut()}>
                                Logout
                            </Text>
                        </View>
                    )}

                    {/* Handle case where role is unknown or null despite being logged in */}
                    {!userRole && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                </>
            )}
        </NavigationContainer>
    );
}
