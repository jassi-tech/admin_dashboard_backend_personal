import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
        
        // Generate serviceAccountKey.json from environment variables if it doesn't exist
        if (!fs.existsSync(serviceAccountPath)) {
            console.log('⚙️  Generating serviceAccountKey.json from environment variables...');
            
            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
            };
            
            fs.writeFileSync(serviceAccountPath, JSON.stringify(serviceAccount, null, 2));
            console.log('✅ serviceAccountKey.json generated successfully');
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
        });
        
        console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('❌ Firebase Admin SDK initialization failed:', error.message);
        throw error; // Don't continue if Admin SDK fails
    }
}

// Export Admin Firestore instance
// This bypasses all Firestore security rules and is designed for server-side use
export const db = admin.firestore();

// Export admin for other uses (auth, storage, etc.)
export default admin;
