import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Helper to sanitize the private key
const sanitizeKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    
    let s = key.trim();
    // 1. Remove surrounding quotes
    if (s.startsWith('"') && s.endsWith('"')) {
        s = s.substring(1, s.length - 1);
    }
    
    // 2. Extract body between headers
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    
    // Replace literal \n with actual newlines first
    s = s.split('\\n').join('\n');
    
    if (s.includes(header) && s.includes(footer)) {
        const body = s.substring(s.indexOf(header) + header.length, s.indexOf(footer))
                      .replace(/\s/g, ''); // Remove ALL whitespace
        const formattedBody = body.match(/.{1,64}/g)?.join('\n');
        return `${header}\n${formattedBody}\n${footer}\n`;
    }
    
    return s;
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        const renderSecretPath = '/etc/secrets/serviceAccountKey.json';
        const localSecretPath = path.join(process.cwd(), 'serviceAccountKey.json');
        const scriptSecretPath = path.join(process.cwd(), 'src', 'scripts', 'serviceAccountKey.json');
        
        let credential;

        if (fs.existsSync(renderSecretPath)) {
            console.log('✅ Found Render secret file at /etc/secrets/serviceAccountKey.json');
            credential = admin.credential.cert(renderSecretPath);
        } else if (fs.existsSync(localSecretPath)) {
            console.log('✅ Found local serviceAccountKey.json');
            credential = admin.credential.cert(localSecretPath);
        } else if (fs.existsSync(scriptSecretPath)) {
            console.log('✅ Found local serviceAccountKey.json in src/scripts/');
            credential = admin.credential.cert(scriptSecretPath);
        } else {
            console.log('⚙️  Initializing Firebase Admin SDK from environment variables...');
            
            const serviceAccount = {
                type: 'service_account',
                project_id: process.env.FIREBASE_PROJECT_ID,
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: sanitizeKey(process.env.FIREBASE_PRIVATE_KEY),
            };

            if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
                throw new Error('Missing essential Firebase environment variables (PROJECT_ID, PRIVATE_KEY, or CLIENT_EMAIL)');
            }

            credential = admin.credential.cert(serviceAccount as any);
        }
        
        admin.initializeApp({
            credential,
        });
        
        console.log('✅ Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed.');
        console.error('Error Details:', error.message);
        console.error('Stack Trace:', error.stack);
        // On Vercel, we might want to log exactly what's missing since we can't see the env
        console.log('Environment Debug:');
        console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'MISSING');
        console.log('- FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'MISSING');
        console.log('- FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? (process.env.FIREBASE_PRIVATE_KEY.length > 50 ? 'Set (Long)' : 'Set (Short/Suspect)') : 'MISSING');
        
        // We DON'T throw here to allow the app to boot and show 500s on routes instead of crashing the whole runtime
    }
}

// Export Admin Firestore instance
// This bypasses all Firestore security rules and is designed for server-side use
export const db = admin.firestore();

// Export admin for other uses (auth, storage, etc.)
export default admin;
