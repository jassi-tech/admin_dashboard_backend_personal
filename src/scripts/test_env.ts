import dotenv from 'dotenv';
dotenv.config();
console.log('TEST ENV:');
console.log('PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('KEY EXISTS:', !!process.env.FIREBASE_PRIVATE_KEY);
if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log('KEY LENGTH:', process.env.FIREBASE_PRIVATE_KEY.length);
    console.log('KEY START:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 30));
    console.log('KEY END:', process.env.FIREBASE_PRIVATE_KEY.substring(process.env.FIREBASE_PRIVATE_KEY.length - 30));
}
