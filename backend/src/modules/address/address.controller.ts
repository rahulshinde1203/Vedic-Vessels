import { Request, Response } from 'express';
import * as addressService from './address.service';
import type { CreateAddressBody } from './address.types';

export async function createAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false, data: null, message: 'Authentication required' }); return; }
  try {
    const addr = await addressService.createAddress(req.user.id, req.body as CreateAddressBody);
    res.status(201).json({ success: true, message: 'Address saved', data: addr });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Failed to save address';
    res.status(status).json({ success: false, data: null, message });
  }
}

export async function getUserAddresses(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false, data: null, message: 'Authentication required' }); return; }
  try {
    const addrs = await addressService.getUserAddresses(req.user.id);
    res.json({ success: true, message: 'Addresses fetched', data: addrs });
  } catch (err: any) {
    res.status(500).json({ success: false, data: null, message: 'Failed to fetch addresses' });
  }
}

export async function getAddressById(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false, data: null, message: 'Authentication required' }); return; }
  try {
    const id   = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ success: false, data: null, message: 'Invalid address ID' }); return; }
    const addr = await addressService.getAddressById(req.user.id, id);
    res.json({ success: true, message: 'Address fetched', data: addr });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Failed to fetch address';
    res.status(status).json({ success: false, data: null, message });
  }
}
