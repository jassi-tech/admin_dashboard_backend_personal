/**
 * Migration Script: Hash Existing Passwords
 * 
 * This script migrates existing plain-text passwords to bcrypt hashed passwords.
 * Run this ONCE after deploying the password encryption changes.
 * 
 * Usage: npx ts-node src/scripts/migrate-passwords.ts
 */

import bcrypt from 'bcryptjs';
import { db } from '../lib/firebase';

const SALT_ROUNDS = 10;

async function migratePasswords() {
    try {
        console.log('Starting password migration...');
        
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        
        if (usersSnapshot.empty) {
            console.log('No users found.');
            return;
        }

        let migratedCount = 0;
        let skippedCount = 0;

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const currentPassword = userData.password;

            if (!currentPassword) {
                console.log(`Skipping user ${doc.id}: No password field`);
                skippedCount++;
                continue;
            }

            // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
            if (currentPassword.startsWith('$2a$') || 
                currentPassword.startsWith('$2b$') || 
                currentPassword.startsWith('$2y$')) {
                console.log(`Skipping user ${doc.id}: Password already hashed`);
                skippedCount++;
                continue;
            }

            // Hash the plain text password
            const hashedPassword = await bcrypt.hash(currentPassword, SALT_ROUNDS);

            // Update the user document
            await db.collection('users').doc(doc.id).update({
                password: hashedPassword
            });

            console.log(`✓ Migrated password for user ${doc.id} (${userData.email || 'no email'})`);
            migratedCount++;
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Migrated: ${migratedCount} users`);
        console.log(`Skipped: ${skippedCount} users`);
        console.log('========================\n');

    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Run the migration
migratePasswords()
    .then(() => {
        console.log('Migration script finished successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
