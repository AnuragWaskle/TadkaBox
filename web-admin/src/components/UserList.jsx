import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Edit2, Shield, User, Mail, Calendar } from 'lucide-react';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const userList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
            }
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole
            });
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating role:", error);
            alert("Failed to update role.");
        }
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-gray-500 mt-1">View and manage all registered users</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                    <div className="bg-gray-50 px-4 py-2 rounded-lg whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-500">Total Users:</span>
                        <span className="ml-2 font-bold text-gray-900">{users.length}</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-8 py-4">User</th>
                            <th className="px-8 py-4">Role</th>
                            <th className="px-8 py-4">Joined Date</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                                            {user.email?.[0]?.toUpperCase() || <User size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                {user.email}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    {editingUser === user.id ? (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                            className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:border-primary"
                                            autoFocus
                                            onBlur={() => setEditingUser(null)}
                                        >
                                            <option value="CUSTOMER">CUSTOMER</option>
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="COOK">COOK</option>
                                            <option value="DELIVERY">DELIVERY</option>
                                        </select>
                                    ) : (
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide cursor-pointer hover:opacity-80
                                                ₹{user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'COOK' ? 'bg-orange-100 text-orange-800' :
                                                        user.role === 'DELIVERY' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'}`}
                                            onClick={() => setEditingUser(user.id)}
                                            title="Click to edit role"
                                        >
                                            {user.role === 'ADMIN' && <Shield size={12} />}
                                            {user.role || 'CUSTOMER'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-gray-500 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setEditingUser(user.id)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Edit Role"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
