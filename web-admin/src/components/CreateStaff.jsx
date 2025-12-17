import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Re-initialize a secondary app to avoid logging out the admin
const secondaryApp = initializeApp({
    apiKey: "AIzaSyDE6Egdx6xDo1DPnmO2y0BjOeX9pViaSKs",
    authDomain: "foodorderingapp-3acfc.firebaseapp.com",
    projectId: "foodorderingapp-3acfc",
    storageBucket: "foodorderingapp-3acfc.firebasestorage.app",
    messagingSenderId: "727960268796",
    appId: "1:727960268796:web:e95d2b50d82e5847f5cc79",
    measurementId: "G-LBMZWS3CK3"
}, "SecondaryApp");

const secondaryAuth = getAuth(secondaryApp);
const db = getFirestore(secondaryApp);

export default function CreateStaff({ onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('DELIVERY');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                role,
                createdAt: new Date()
            });
            setMessage(`Success! Created ₹{role} account for ₹{email}`);
            setEmail('');
            setPassword('');
        } catch (error) {
            setMessage('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Create Staff Account</h2>
                {message && <p className={`mb-4 text-sm ₹{message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

                <form onSubmit={handleCreate}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-1">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className="w-full border p-2 rounded">
                            <option value="DELIVERY">Delivery</option>
                            <option value="COOK">Cook</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-2 rounded">
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
