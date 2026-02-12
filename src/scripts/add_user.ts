import * as readline from 'readline';
import { db } from '../lib/firebase';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function addUser() {
    try {
        console.log('\n=== Add User to Firestore ===\n');
        
        const email = await question('Enter email: ');
        const password = await question('Enter password: ');
        const name = await question('Enter name (optional): ');
        
        if (!email || !password) {

            rl.close();
            return;
        }

        // Add user to Firestore
        const userRef = await db.collection('users').add({
            email: email.trim(),
            password: password.trim(), // Note: In production, you should hash passwords!
            name: name.trim() || 'User',
            role: 'admin',
            status: 'Active',
            createdAt: new Date().toISOString(),
            key: Date.now().toString()
        });

        console.log('\n✅ User added successfully!');
        console.log('User ID:', userRef.id);
        console.log('Email:', email);
        console.log('\n⚠️  WARNING: Password is stored in plain text. Consider implementing bcrypt hashing for production!\n');
        
        rl.close();
    } catch (error: any) {

        rl.close();
    }
}

addUser();
