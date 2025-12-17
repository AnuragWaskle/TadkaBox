import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { pickImage, uploadImageToCloudinary } from '../../services/CloudinaryService';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function AddMenuItemScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        const uri = await pickImage();
        if (uri) {
            setImageUri(uri);
        }
    };

    const handleSave = async () => {
        if (!name || !price || !imageUri) {
            Alert.alert("Missing Fields", "Please provide name, price, and an image.");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Image
            const imageUrl = await uploadImageToCloudinary(imageUri);

            // 2. Save to Firestore
            await addDoc(collection(db, 'menuItems'), {
                name,
                description,
                price: parseFloat(price),
                category,
                imageUrl,
                isAvailable: true,
                createdAt: new Date()
            });

            Alert.alert("Success", "Menu Item Added!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to save menu item.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Menu Item</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera" size={40} color={COLORS.gray} />
                            <Text style={styles.placeholderText}>Tap to add image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.label}>Item Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Spicy Chicken Burger"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe the dish..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Price (₹)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Category</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Burgers"
                            value={category}
                            onChangeText={setCategory}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Item</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
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
    imagePicker: {
        height: 200,
        backgroundColor: '#eee',
        borderRadius: 12,
        marginBottom: SPACING.l,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed'
    },
    imagePreview: { width: '100%', height: '100%' },
    placeholder: { alignItems: 'center' },
    placeholderText: { color: COLORS.textLight, marginTop: SPACING.s },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.s },
    input: {
        backgroundColor: COLORS.white,
        padding: SPACING.m,
        borderRadius: 8,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
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
