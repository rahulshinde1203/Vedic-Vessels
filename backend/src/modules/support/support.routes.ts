import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import * as ctrl from './support.controller';

const router = Router();

router.use(authenticate);

router.post('/',           ctrl.createTicket);
router.get('/my',          ctrl.getMyTickets);
router.get('/:id',         ctrl.getTicketById);
router.post('/:id/reply',  ctrl.addReply);

export default router;
