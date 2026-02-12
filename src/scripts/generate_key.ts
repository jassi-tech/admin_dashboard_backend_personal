import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sanitize = (val: string | undefined) => {
    if (!val) return undefined;
    return val.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
};

const serviceAccount = {
    project_id: sanitize(process.env.FIREBASE_PROJECT_ID),
    private_key: sanitize(process.env.FIREBASE_PRIVATE_KEY),
    client_email: sanitize(process.env.FIREBASE_CLIENT_EMAIL)
};

if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
    fs.writeFileSync('serviceAccountKey.json', JSON.stringify(serviceAccount, null, 2));
    console.log('serviceAccountKey.json generated successfully using JSON.stringify');
} else {
    console.error('Missing credentials in .env to generate JSON');
}
