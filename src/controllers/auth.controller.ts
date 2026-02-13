import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../lib/firebase';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Invalid input format' });
    }
    
    try {
        // Admin SDK syntax: db.collection().where().limit().get()
        const userSnapshot = await db.collection('users')
            .where('email', '==', email.toLowerCase().trim())
            .limit(1)
            .get();
        
        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Admin SDK: access document data with .data()
        const userData = userSnapshot.docs[0]?.data();
        
        if (!userData) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Use bcrypt to compare password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        
        if (isPasswordValid) {
            return res.json({ message: 'Login success, proceed to 2FA' });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verify2FA = async (req: Request, res: Response) => {
    const { code, email } = req.body;
    // Simple 2FA check as requested
    const expected2FA = process.env.TWO_FA_CODE || '123456';
    
    if (code === expected2FA) {
        try {
            // Find the user by email to get real ID and details
            let userId = '1';
            let userRole = 'admin';
            let userName = 'Admin User';

            if (email) {
                const userSnapshot = await db.collection('users')
                    .where('email', '==', email)
                    .limit(1)
                    .get();

                if (!userSnapshot.empty && userSnapshot.docs[0]) {
                    const doc = userSnapshot.docs[0];
                    userId = doc.id;
                    const userData = doc.data();
                    userRole = userData.role || 'admin';
                    userName = userData.name || 'Admin User';
                }
            }

            const token = jwt.sign(
                { id: userId, email, role: userRole, name: userName }, 
                process.env.JWT_SECRET || 'secret', 
                { expiresIn: '1d' }
            );

            res.cookie('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });
            return res.json({ message: 'Authentication successful', token, user: { name: userName, email, role: userRole } });
        } catch (error) {
            console.error('Error during 2FA user lookup:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    return res.status(400).json({ message: 'Invalid 2FA code' });
};

export const getMe = async (req: Request, res: Response) => {
    try {
        // req.user is populated by authMiddleware
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        // Optionally fetch fresh data from DB if needed, but token data is usually enough for UI
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { currentPassword, newPassword } = req.body;

        if (!user || !user.email) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Input validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ message: 'Invalid input format' });
        }

        // Password strength validation
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        // Verify current password
        const userSnapshot = await db.collection('users')
            .where('email', '==', user.email)
            .limit(1)
            .get();

        if (userSnapshot.empty || !userSnapshot.docs[0]) {
            return res.status(404).json({ message: 'User not found' });
        }

        const doc = userSnapshot.docs[0];
        const userData = doc.data();

        // Use bcrypt to verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, userData.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in Firestore and set timestamp to invalidate old tokens
        await db.collection('users').doc(doc.id).update({
            password: hashedPassword,
            passwordChangedAt: new Date().toISOString()
        });

        // Clear the current user's cookie to force re-login
        res.clearCookie('auth_token');

        res.json({ message: 'Password updated successfully', requiresRelogin: true });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
};
