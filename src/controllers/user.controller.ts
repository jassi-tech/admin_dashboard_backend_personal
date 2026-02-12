import { Request, Response } from 'express';
import { db } from '../lib/firebase';

const COLLECTION = 'users';

export const getUsers = async (req: Request, res: Response) => {
    try {
        // Admin SDK: db.collection().get()
        const querySnapshot = await db.collection(COLLECTION).get();
        const users = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(users);
    } catch (error) {
        console.error('Error fetching users from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body;
        // Admin SDK: db.collection().add()
        const docRef = await db.collection(COLLECTION).add({
            ...userData,
            status: userData.status || 'Active',
            key: userData.key || Date.now().toString()
        });
        res.status(201).json({ id: docRef.id, ...userData });
    } catch (error) {
        console.error('Error creating user in Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Admin SDK: db.collection().doc().delete()
        await db.collection(COLLECTION).doc(id as string).delete();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
