import { Router } from 'express';
import * as addressController from './address.controller';
import { authenticate } from '../../common/middleware/auth';

const router = Router();

router.post('/',           authenticate, addressController.createAddress);
router.get('/',            authenticate, addressController.getUserAddresses);
router.get('/:id',         authenticate, addressController.getAddressById);
router.patch('/:id',       authenticate, addressController.updateAddress);
router.delete('/:id',      authenticate, addressController.deleteAddress);
router.patch('/:id/default', authenticate, addressController.setDefaultAddress);

export default router;
