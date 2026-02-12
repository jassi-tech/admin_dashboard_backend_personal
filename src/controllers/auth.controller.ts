import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../lib/firebase';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    try {
        // Admin SDK syntax: db.collection().where().limit().get()
        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
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

        if (password === userData.password) {
            return res.json({ message: 'Login success, proceed to 2FA' });
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verify2FA = async (req: Request, res: Response) => {
    const { code } = req.body;
    const expected2FA = process.env.TWO_FA_CODE || '123456';
    if (code === expected2FA) {
        const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({ message: 'Authentication successful', token });
    }
    return res.status(400).json({ message: 'Invalid 2FA code' });
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
};
