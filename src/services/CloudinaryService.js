import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const CLOUD_NAME = 'dsyo71ipi';
const UPLOAD_PRESET = 'food_app_unsigned'; // Created via script

export const pickImage = async () => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // Compress image
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    } catch (error) {
        console.error("Error picking image:", error);
        return null;
    }
};

export const uploadImageToCloudinary = async (imageUri) => {
    if (!imageUri) return null;

    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // Adjust based on actual file type if needed, but jpeg usually works
        name: 'upload.jpg',
    });
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', CLOUD_NAME);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/₹{CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: data,
        });

        const result = await response.json();
        if (result.secure_url) {
            return result.secure_url;
        } else {
            console.error("Cloudinary Upload Error:", result);
            throw new Error("Image upload failed");
        }
    } catch (error) {
        console.error("Upload Service Error:", error);
        throw error;
    }
};
