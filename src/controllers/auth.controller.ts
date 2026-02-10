import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // Mock login
    if (email === 'admin@admin.com' && password === 'admin') {
        return res.json({ message: 'Login success, proceed to 2FA' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
};

export const verify2FA = async (req: Request, res: Response) => {
    const { code } = req.body;
    if (code === '123456') {
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
