import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function KitchenDisplay() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for active orders
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Filter for active orders only (Placed or Preparing)
            const activeOrders = orderList.filter(order =>
                ['PLACED', 'PREPARING'].includes(order.status)
            );
            setOrders(activeOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) return <div className="p-4">Loading kitchen...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Kitchen Display System</h2>
                    <p className="text-gray-500 mt-1">Manage active orders in real-time</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                    <span className="font-bold text-primary text-xl">{orders.length}</span>
                    <span className="text-gray-500 ml-2">Active Orders</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">🧹</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">All Caught Up!</p>
                    <p className="text-gray-500 mt-2">No active orders at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map(order => (
                        <div key={order.id} className={`flex flex-col bg-white rounded-2xl shadow-sm border-2 overflow-hidden card-hover ₹{order.status === 'PLACED' ? 'border-red-100 ring-1 ring-red-100' : 'border-orange-100 ring-1 ring-orange-100'}`}>
                            <div className={`p-4 flex justify-between items-center ₹{order.status === 'PLACED' ? 'bg-red-50' : 'bg-orange-50'}`}>
                                <div>
                                    <span className={`text-xs font-black uppercase tracking-wider ₹{order.status === 'PLACED' ? 'text-red-600' : 'text-orange-600'}`}>
                                        {order.status === 'PLACED' ? '🔥 NEW ORDER' : '👨‍🍳 PREPARING'}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">#{order.id.slice(-4).toUpperCase()}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-500">Time</p>
                                    <p className="text-sm font-mono font-medium text-gray-700">
                                        {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg text-sm font-bold text-gray-800 border border-gray-200">
                                                {item.quantity}
                                            </span>
                                            <span className="text-gray-700 font-medium leading-tight pt-1">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <div className="flex gap-2">
                                    {order.status === 'PLACED' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'PREPARING')}
                                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span>Start Cooking</span>
                                            <span>🔥</span>
                                        </button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'READY_FOR_PICKUP')}
                                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span>Ready for Pickup</span>
                                            <span>✅</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
