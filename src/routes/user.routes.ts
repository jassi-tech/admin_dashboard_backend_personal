import { Router } from 'express';
import { getUsers, createUser, deleteUser } from '../controllers/user.controller';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.delete('/:key', deleteUser);

export default router;
