import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
        });
        
        console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('❌ Firebase Admin SDK failed to initialize:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Please ensure serviceAccountKey.json exists and is properly formatted.');
        throw error; // Don't continue if Admin SDK fails
    }
}

// Export Admin Firestore instance
// This bypasses all Firestore security rules and is designed for server-side use
export const db = admin.firestore();

// Export admin for other uses (auth, storage, etc.)
export default admin;
