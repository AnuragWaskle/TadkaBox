# TadkaBox Web Admin Portal 💻

This directory contains the **Web Admin Portal** for TadkaBox, built using **React**, **Vite**, and **Tailwind CSS**.

## 🎯 Target Audience
*   **Admins**: For full system management (Menu, Staff, Analytics).
*   **Cooks**: For the Kitchen Display System (KDS) to manage incoming orders.

## 🛠 Installation & Setup

### Prerequisites
*   Node.js installed.

### Steps to Run
1.  **Navigate to this directory**:
    ```bash
    cd web-admin
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The app will typically run at `http://localhost:5173`.

## 📂 Project Structure

*   `src/pages/`:
    *   `Login.jsx`: Secure login for staff.
    *   `Dashboard.jsx`: Main dashboard with role-based views (Admin vs Cook).
*   `src/components/`:
    *   `CreateStaff.jsx`: Modal for Admins to create new Cook/Delivery accounts.
*   `src/context/`:
    *   `AuthContext.jsx`: Manages user authentication state.
*   `src/firebase.js`: Firebase configuration for the web app.

## 🔑 Key Features

### 1. Admin Dashboard
*   **Manage Menu**: Add/Edit/Delete food items (Coming Soon).
*   **Manage Staff**: **Create accounts** for Delivery Drivers and Cooks.
    *   *Note: This uses a secondary Firebase app instance to allow Admins to create users without being logged out.*
*   **View Orders**: Track all system orders.

### 2. Kitchen Display System (Cook)
*   View active orders in real-time.
*   Mark orders as "Preparing" or "Ready".

## 🎨 Styling
This project uses **Tailwind CSS** for styling.
*   Configuration: `tailwind.config.js`
*   Global Styles: `src/index.css`

## 🚀 Deployment
To build the project for production:
```bash
npm run build
```
The output will be in the `dist` folder, ready to be deployed to Vercel, Netlify, or Firebase Hosting.
