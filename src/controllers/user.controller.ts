import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

const readDb = async () => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading db file:', error);
        return { users: [], stats: {}, recentActivity: [] };
    }
};

const writeDb = async (db: any) => {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error writing db file:', error);
    }
};

export const getUsers = async (req: Request, res: Response) => {
    const db = await readDb();
    res.json(db.users);
};

export const deleteUser = async (req: Request, res: Response) => {
    const { key } = req.params;
    const db = await readDb();
    
    const userIndex = db.users.findIndex((u: any) => u.key === key);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    db.users.splice(userIndex, 1);
    await writeDb(db);
    
    res.json({ message: 'User deleted successfully' });
};

export const createUser = async (req: Request, res: Response) => {
    const userData = req.body;
    const db = await readDb();
    
    const newUser = {
        ...userData,
        key: Date.now().toString(),
        status: 'Active'
    };
    
    db.users.push(newUser);
    // Also update recent activity if needed
    db.recentActivity.unshift({
        key: newUser.key,
        name: newUser.name,
        status: newUser.status,
        lastLogin: 'Just now'
    });
    // Limit recent activity
    db.recentActivity = db.recentActivity.slice(0, 10);
    
    await writeDb(db);
    
    res.status(201).json({ message: 'User created successfully', user: newUser });
};
