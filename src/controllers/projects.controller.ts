import type { Request, Response } from 'express';
import { db } from '../lib/firebase';

const COLLECTION = 'projects';

export const getProjects = async (req: Request, res: Response) => {
    try {
        // Admin SDK: db.collection().get()
        const querySnapshot = await db.collection(COLLECTION).get();
        const projectList = querySnapshot.docs.map(doc => {
            const p = doc.data();
            return {
                id: doc.id,
                name: p.name,
                status: p.status,
                url: p.url,
                isLive: p.isLive,
                country: p.country,
                deployments: p.deployments
            };
        });
        res.json(projectList);
    } catch (error) {
        console.error('Error fetching projects from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProjectDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Admin SDK: db.collection().doc().get()
        const docSnap = await db.collection(COLLECTION).doc(id as string).get();
        
        if (!docSnap.exists) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        console.error('Error fetching project details from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Admin SDK: db.collection().doc()
        const docRef = db.collection(COLLECTION).doc(id as string);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        const lastChecked = new Date().toISOString();
        // Admin SDK: doc.update()
        await docRef.update({ lastChecked });
        
        res.json({ id, ...docSnap.data(), lastChecked });
    } catch (error) {
        console.error('Error updating project status in Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, url, country } = req.body;
        
        const newProject = {
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
        
        // Admin SDK: db.collection().add()
        const docRef = await db.collection(COLLECTION).add(newProject);
        
        res.status(201).json({ id: docRef.id, ...newProject });
    } catch (error) {
        console.error('Error creating project in Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Admin SDK: db.collection().doc()
        const docRef = db.collection(COLLECTION).doc(id as string);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Admin SDK: doc.delete()
        await docRef.delete();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project from Firestore:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
