import dotenv from 'dotenv';
import fs from 'fs';
import { execSync } from 'child_process';

dotenv.config();

const sanitize = (val: string | undefined) => {
    if (!val) return undefined;
    return val.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
};

const privateKey = sanitize(process.env.FIREBASE_PRIVATE_KEY);

if (privateKey) {
    fs.writeFileSync('test_key.pem', privateKey);
    try {
        console.log('Running openssl rsa -check -in test_key.pem -noout...');
        const result = execSync('openssl rsa -check -in test_key.pem -noout', { encoding: 'utf-8' });
        console.log('OpenSSL Result:', result || 'RSA key is valid');
    } catch (error: any) {

    } finally {
        // fs.unlinkSync('test_key.pem');
    }
} else {

}
