import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const sanitize = (val: string | undefined) => {
    if (!val) return undefined;
    let s = val.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
    
    if (s.includes('-----BEGIN PRIVATE KEY-----')) {
        let body = s.replace('-----BEGIN PRIVATE KEY-----', '').replace('-----END PRIVATE KEY-----', '').replace(/\s/g, '');
        let formattedBody = body.match(/.{1,64}/g)?.join('\n');
        return `-----BEGIN PRIVATE KEY-----\n${formattedBody}\n-----END PRIVATE KEY-----\n`;
    }
    return s;
};

const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID?.replace(/^"|"$/g, ''),
    private_key: sanitize(process.env.FIREBASE_PRIVATE_KEY),
    client_email: process.env.FIREBASE_CLIENT_EMAIL?.replace(/^"|"$/g, '')
};

if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
    fs.writeFileSync('serviceAccountKey.json', JSON.stringify(serviceAccount, null, 2));
    console.log('serviceAccountKey.json regenerated with 64-char wrapping');
} else {

}
