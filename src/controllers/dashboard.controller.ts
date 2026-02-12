import { Request, Response } from 'express';
import { db } from '../lib/firebase';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Admin SDK: db.collection().doc().get()
        const statsDoc = await db.collection('stats').doc('main').get();
        const stats = statsDoc.exists ? statsDoc.data() : { users: 0, revenue: 0, orders: 0, active: 0 };
        
        // Admin SDK: db.collection().orderBy().limit().get()
        const activitySnapshot = await db.collection('recentActivity')
            .orderBy('key', 'desc')
            .limit(10)
            .get();
        const recentActivity = activitySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            stats,
            recentActivity
        });
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
};
