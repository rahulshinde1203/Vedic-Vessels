import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.get('/profile',   authenticate, userController.getProfile);
router.patch('/profile', authenticate, userController.updateProfile);

export default router;
