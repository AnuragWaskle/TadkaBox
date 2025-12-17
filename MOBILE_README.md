# TadkaBox Mobile Application 📱

This directory contains the source code for the **TadkaBox Mobile App**, built using React Native (Expo).

## 🎯 Target Audience
*   **Customers**: For browsing food, placing orders, and managing their profile.
*   **Delivery Staff**: For viewing assigned deliveries and updating order status.

## 🛠 Installation & Setup

### Prerequisites
*   Node.js
*   Android Studio (with SDK and Emulator configured)

### Steps to Run
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Metro Bundler & Launch on Android**:
    ```bash
    npm run android
    ```

## 📂 Project Structure

*   `App.js`: Main entry point.
*   `src/navigation`: Contains `RootNavigator`, `CustomerTabNavigator`, etc.
*   `src/screens`:
    *   `auth/`: Login and Register screens.
    *   `customer/`: Home, Menu, Cart, Profile, Order History.
    *   `delivery/`: Delivery dashboard.
*   `src/context`: Global state management (`AuthContext`, `CartContext`).
*   `src/services`: Firebase and Cloudinary service integrations.
*   `src/constants`: Theme colors and configuration.

## 📦 Building the APK

To generate a debug APK for testing on physical devices:

1.  Navigate to the `android` directory:
    ```bash
    cd android
    ```
2.  Run the Gradle build command:
    ```bash
    ./gradlew assembleDebug
    ```
3.  **Output Location**:
    The `.apk` file will be generated at:
    `android/app/build/outputs/apk/debug/app-debug.apk`

## 🔑 Key Features
*   **Foodie Theme**: Premium UI with vibrant colors and animations.
*   **Role-Based Access**: Automatically detects user role (Customer vs Delivery).
*   **Real-time Updates**: Uses Firebase Firestore for live data.
