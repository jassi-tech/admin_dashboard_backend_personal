import { Request, Response } from 'express';
import { db } from '../lib/firebase';

export const getLocations = async (req: Request, res: Response) => {
    try {
        // Admin SDK: db.collection().get()
        const querySnapshot = await db.collection('locations').get();
        const locations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(locations);
    } catch (error) {
        console.error('Error fetching locations from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
