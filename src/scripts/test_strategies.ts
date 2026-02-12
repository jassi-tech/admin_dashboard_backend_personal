import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const rawKey = process.env.FIREBASE_PRIVATE_KEY;
console.log('Raw key length:', rawKey?.length);

const strategies = [
    // 1. Just sanitize backslashes
    (key: string) => key.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim(),
    // 2. Wrap at 64 chars
    (key: string) => {
        let s = key.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
        if (s.includes('-----BEGIN PRIVATE KEY-----')) {
            let body = s.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '');
            let formattedBody = body.match(/.{1,64}/g)?.join('\n');
            return `-----BEGIN PRIVATE KEY-----\n${formattedBody}\n-----END PRIVATE KEY-----\n`;
        }
        return s;
    },
    // 3. Keep as is but remove surrounding quotes
    (key: string) => key.replace(/^"|"$/g, '').trim()
];

strategies.forEach((strategy, i) => {
    try {
        const key = strategy(rawKey || '');
        console.log(`Strategy ${i + 1} test...`);
        if (admin.apps.length) {
            // @ts-ignore
            admin.app().delete();
        }
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID?.replace(/^"|"$/g, '') as string,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/^"|"$/g, '') as string,
                privateKey: key
            })
        }, `test-${i}`);
        console.log(`Strategy ${i + 1} SUCCEEDED`);
    } catch (e: any) {
        console.log(`Strategy ${i + 1} FAILED: ${e.message}`);
    }
});
