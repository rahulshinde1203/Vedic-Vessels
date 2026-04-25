import { Router } from 'express';
import * as addressController from './address.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.post('/',    authenticate, addressController.createAddress);
router.get('/',     authenticate, addressController.getUserAddresses);
router.get('/:id',  authenticate, addressController.getAddressById);

export default router;
