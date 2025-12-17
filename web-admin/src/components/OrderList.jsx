import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function OrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(orderList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED': return 'bg-blue-100 text-blue-800';
            case 'PREPARING': return 'bg-orange-100 text-orange-800';
            case 'READY_FOR_PICKUP': return 'bg-yellow-100 text-yellow-800';
            case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-4">Loading orders...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">All Orders</h2>
                    <p className="text-gray-500 mt-1">Track and manage all customer orders</p>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">Total Orders:</span>
                    <span className="ml-2 font-bold text-gray-900">{orders.length}</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-8 py-4">Order ID</th>
                            <th className="px-8 py-4">Date & Time</th>
                            <th className="px-8 py-4">Customer</th>
                            <th className="px-8 py-4">Items</th>
                            <th className="px-8 py-4">Total</th>
                            <th className="px-8 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-5 font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                                <td className="px-8 py-5 text-gray-500 text-sm">
                                    {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : '-'}
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 text-white flex items-center justify-center text-xs font-bold">
                                            {order.userId ? order.userId.slice(0, 1).toUpperCase() : 'G'}
                                        </div>
                                        <span className="text-gray-900 font-medium">{order.userId ? 'User ' + order.userId.slice(0, 4) : 'Guest'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-gray-600 text-sm max-w-xs truncate">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </td>
                                <td className="px-8 py-5 font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
