import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        res.json({ 
            stats: db.stats, 
            recentActivity: db.recentActivity 
        });
    } catch (error) {
        console.error('Error reading db file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
