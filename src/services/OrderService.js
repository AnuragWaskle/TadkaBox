import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';

// Place a new order
export const placeOrder = async (userId, items, totalAmount) => {
    try {
        const orderRef = await addDoc(collection(db, 'orders'), {
            customerId: userId,
            items, // Array of { menuItemId, name, quantity, price }
            totalAmount,
            status: 'PLACED',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return orderRef.id;
    } catch (error) {
        console.error("Error placing order:", error);
        throw error;
    }
};

// Real-time subscription to orders based on role
export const subscribeToOrders = (role, userId, callback) => {
    let q;
    const ordersRef = collection(db, 'orders');

    try {
        if (role === 'CUSTOMER') {
            q = query(ordersRef, where('customerId', '==', userId));
        } else if (role === 'COOK') {
            q = query(
                ordersRef,
                where('status', 'in', ['PLACED', 'ASSIGNED_TO_COOK', 'PREPARING'])
            );
        } else if (role === 'DELIVERY') {
            q = query(
                ordersRef,
                where('status', 'in', ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'])
            );
        } else {
            q = query(ordersRef);
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Client-side sorting
            orders.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return role === 'CUSTOMER' || role === 'ADMIN' ? dateB - dateA : dateA - dateB;
            });

            callback(orders);
        }, (error) => {
            console.error("Order subscription error:", error);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error creating subscription:", error);
        return () => { };
    }
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: new Date(),
            ...additionalData
        });
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;
    }
};
