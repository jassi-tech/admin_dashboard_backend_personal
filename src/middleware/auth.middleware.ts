import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../lib/firebase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        
        // Check if password was changed after token was issued
        if (decoded.email) {
            const userSnapshot = await db.collection('users')
                .where('email', '==', decoded.email)
                .limit(1)
                .get();

            if (!userSnapshot.empty && userSnapshot.docs[0]) {
                const userData = userSnapshot.docs[0].data();
                const passwordChangedAt = userData.passwordChangedAt;
                
                if (passwordChangedAt) {
                    const passwordChangedTime = new Date(passwordChangedAt).getTime() / 1000;
                    const tokenIssuedTime = decoded.iat || 0;
                    
                    if (passwordChangedTime > tokenIssuedTime) {
                        return res.status(401).json({ 
                            message: 'Session expired due to password change',
                            requiresRelogin: true 
                        });
                    }
                }
            }
        }
        
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
