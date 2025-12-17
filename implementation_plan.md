# Food Ordering System - Implementation Plan & Architecture

## 1. System Architecture

### Frontend
- **Framework**: React Native with Expo (Managed Workflow).
- **Navigation**: React Navigation (Stack for Auth, Tab/Drawer for different roles).
- **State Management**: React Context API (for Auth and Global State) + Local State.
- **UI Library**: Custom styles using `StyleSheet` (Vanilla CSS-in-JS) for maximum control and "premium" feel.

### Backend (Firebase - Free Tier)
- **Authentication**: Firebase Auth (Email/Password).
- **Database**: Cloud Firestore (NoSQL).
- **Storage**: Firebase Storage (Menu images).
- **Notifications**: Firebase Cloud Messaging (FCM) - *Note: Push notifications in Expo Go have limitations, will implement logic for local notifications or in-app updates first.*

## 2. Database Schema (Firestore)

### `users` Collection
```json
{
  "uid": "string (PK)",
  "email": "string",
  "fullName": "string",
  "role": "string ('CUSTOMER', 'ADMIN', 'COOK', 'DELIVERY')",
  "createdAt": "timestamp"
}
```

### `menuItems` Collection
```json
{
  "id": "string (PK)",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "imageUrl": "string",
  "isAvailable": "boolean",
  "createdAt": "timestamp"
}
```

### `orders` Collection
```json
{
  "id": "string (PK)",
  "customerId": "string (FK)",
  "customerName": "string",
  "items": [
    {
      "menuItemId": "string",
      "name": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number",
  "status": "string ('PLACED', 'ASSIGNED_TO_COOK', 'PREPARING', 'READY', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')",
  "cookId": "string (FK, nullable)",
  "deliveryBoyId": "string (FK, nullable)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 3. Security Rules (Firestore)

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/₹(database)/documents/users/₹(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      return isSignedIn() && getUserData().role == role;
    }

    // Users: Users can read/write their own profile. Admin can read all.
    match /users/{userId} {
      allow read: if request.auth.uid == userId || hasRole('ADMIN');
      allow write: if request.auth.uid == userId || hasRole('ADMIN');
    }

    // Menu Items: Public read. Admin write.
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if hasRole('ADMIN');
    }

    // Orders: 
    // - Customer: create, read own.
    // - Admin: read/write all.
    // - Cook: read assigned or status='PLACED'/'ASSIGNED_TO_COOK', update status.
    // - Delivery: read assigned or status='READY', update status.
    match /orders/{orderId} {
      allow create: if hasRole('CUSTOMER');
      allow read: if hasRole('ADMIN') 
                  || (hasRole('CUSTOMER') && resource.data.customerId == request.auth.uid)
                  || (hasRole('COOK')) // Simplified for list views, refine in query
                  || (hasRole('DELIVERY'));
      allow update: if hasRole('ADMIN') 
                    || (hasRole('COOK') && (resource.data.cookId == request.auth.uid || resource.data.cookId == null))
                    || (hasRole('DELIVERY') && (resource.data.deliveryBoyId == request.auth.uid || resource.data.deliveryBoyId == null));
    }
  }
}
```

## 4. App Structure

```
/
├── assets/
├── src/
│   ├── components/       # Reusable UI components (Button, Card, Input)
│   ├── config/           # Firebase config, Theme constants
│   ├── context/          # AuthContext, OrderContext
│   ├── navigation/       # Stack & Tab Navigators
│   ├── screens/
│   │   ├── auth/         # Login, Register
│   │   ├── customer/     # Home, Cart, OrderHistory, TrackOrder
│   │   ├── admin/        # Dashboard, ManageMenu, ManageStaff
│   │   ├── cook/         # KitchenDashboard, OrderDetails
│   │   └── delivery/     # DeliveryDashboard, MapView
│   ├── services/         # Firebase service functions
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Helper functions
├── App.js                # Entry point
└── app.json
```

## 5. Step-by-Step Implementation Plan

1.  **Project Initialization**: Create Expo app and install dependencies (React Navigation, Firebase, etc.).
2.  **Firebase Setup**: Configure Firebase SDK in the app.
3.  **Authentication Flow**: Implement Login/Signup with Role selection (for demo purposes, or Admin assigns roles).
4.  **Navigation Setup**: Create the root navigator that switches based on User Role.
5.  **Customer Features**: Menu browsing, Cart, Place Order.
6.  **Admin Features**: Menu management, Order monitoring.
7.  **Cook Features**: Kitchen view, Status updates.
8.  **Delivery Features**: Delivery view, Status updates.
9.  **Styling & Polish**: Apply premium aesthetics.
