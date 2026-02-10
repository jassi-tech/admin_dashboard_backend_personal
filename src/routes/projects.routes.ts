import { Router } from 'express';
import { getProjects, getProjectDetails, checkProjectStatus, createProject, deleteProject } from '../controllers/projects.controller';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectDetails);
router.get('/:id/check', checkProjectStatus);
router.delete('/:id', deleteProject);

export default router;
