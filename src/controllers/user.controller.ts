import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const userData = req.body;
        
        // Hash password if provided
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        
        // Admin SDK: db.collection().add()
        const docRef = await db.collection(COLLECTION).add({
            ...userData,
            status: userData.status || 'Active',
            key: userData.key || Date.now().toString()
        });
        
        // Don't return the hashed password
        const { password, ...userResponse } = userData;
        res.status(201).json({ id: docRef.id, ...userResponse });
    } catch (error) {

        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        // Remove sensitive or immutable fields if necessary
        delete updates.id;
        delete updates.email; // Usually we don't allow email updates this easily
        delete updates.key;

        // Admin SDK: db.collection().doc().update()
        await db.collection(COLLECTION).doc(id as string).update(updates);
        
        res.json({ message: 'User updated successfully', ...updates });
    } catch (error) {
        console.error('Error updating user:', error);
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

        res.status(500).json({ message: 'Internal server error' });
    }
};
