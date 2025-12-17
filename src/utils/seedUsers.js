import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const TEST_USERS = [
    { email: 'admin@test.com', password: 'Admin@123', role: 'ADMIN', name: 'Admin User' },
    { email: 'cook@test.com', password: 'Cook@123', role: 'COOK', name: 'Chef Gordon' },
    { email: 'delivery@test.com', password: 'Delivery@123', role: 'DELIVERY', name: 'Fast Delivery' },
    { email: 'user@test.com', password: 'User@123', role: 'CUSTOMER', name: 'Hungry Customer' }
];

export const seedTestUsers = async () => {
    console.log("Starting seed process...");
    let results = [];

    // We need to sign out first to ensure we don't mess up current session
    await signOut(auth);

    for (const user of TEST_USERS) {
        try {
            console.log(`Creating ₹{user.role}: ₹{user.email}`);

            // 1. Check if user exists by trying to login
            try {
                await signInWithEmailAndPassword(auth, user.email, user.password);
                console.log(`User ₹{user.email} already exists.`);
                results.push(`✅ ₹{user.role} already exists`);
            } catch (loginError) {
                // If login fails, try to create
                if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
                    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);

                    // 2. Create Firestore Doc
                    await setDoc(doc(db, 'users', userCredential.user.uid), {
                        uid: userCredential.user.uid,
                        email: user.email,
                        fullName: user.name,
                        role: user.role,
                        createdAt: new Date()
                    });
                    console.log(`Created ₹{user.email} successfully.`);
                    results.push(`✅ Created ₹{user.role}`);
                } else {
                    throw loginError;
                }
            }

            // Sign out to prepare for next iteration
            await signOut(auth);

        } catch (error) {
            console.error(`Failed to process ₹{user.email}:`, error);
            results.push(`❌ Failed ₹{user.role}: ₹{error.message}`);
        }
    }

    return results.join('\n');
};
