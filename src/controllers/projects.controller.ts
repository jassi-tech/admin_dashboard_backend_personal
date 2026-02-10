import type { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'src/data/db.json');

export const getProjects = async (req: Request, res: Response) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        // Map to return only names and statuses for the list view
        const projectList = db.projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            url: p.url,
            isLive: p.isLive,
            country: p.country,
            deployments: p.deployments
        }));
        res.json(projectList);
    } catch (error) {
        console.error('Error reading db file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjectDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        const project = db.projects.find((p: any) => p.id === id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('Error reading db file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        
        const projectIndex = db.projects.findIndex((p: any) => p.id === id);
        if (projectIndex === -1) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Update lastChecked time
        db.projects[projectIndex].lastChecked = new Date().toISOString();
        
        // Save back to DB
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 4));
        
        res.json(db.projects[projectIndex]);
    } catch (error) {
        console.error('Error checking project status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, url, country } = req.body;
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        
        const newProject = {
            id: (db.projects.length + 1).toString(),
            name,
            url,
            status: 'Stable',
            isLive: true,
            lastChecked: new Date().toISOString(),
            responseTime: 'N/A',
            analysis: 'Analysis pending...',
            country: country || 'Unknown',
            deployments: 1,
            features: {
                pages: 0,
                logs: 0,
                alerts: 0,
                reports: 0
            }
        };
        
        db.projects.push(newProject);
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 4));
        
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data);
        
        const initialLength = db.projects.length;
        db.projects = db.projects.filter((p: any) => p.id !== id);
        
        if (db.projects.length === initialLength) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 4));
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
