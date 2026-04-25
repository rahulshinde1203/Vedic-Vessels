import { Request, Response } from 'express';
import * as addressService from './address.service';
import type { CreateAddressBody, UpdateAddressBody } from './address.types';

function noAuth(res: Response) {
  res.status(401).json({ success: false, data: null, message: 'Authentication required' });
}

export async function createAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const addr = await addressService.createAddress(req.user.id, req.body as CreateAddressBody);
    res.status(201).json({ success: true, message: 'Address saved', data: addr });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to save address' });
  }
}

export async function getUserAddresses(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const addrs = await addressService.getUserAddresses(req.user.id);
    res.json({ success: true, message: 'Addresses fetched', data: addrs });
  } catch {
    res.status(500).json({ success: false, data: null, message: 'Failed to fetch addresses' });
  }
}

export async function getAddressById(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ success: false, data: null, message: 'Invalid address ID' }); return; }
    const addr = await addressService.getAddressById(req.user.id, id);
    res.json({ success: true, message: 'Address fetched', data: addr });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to fetch address' });
  }
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ success: false, data: null, message: 'Invalid address ID' }); return; }
    const addr = await addressService.updateAddress(req.user.id, id, req.body as UpdateAddressBody);
    res.json({ success: true, message: 'Address updated', data: addr });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to update address' });
  }
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ success: false, data: null, message: 'Invalid address ID' }); return; }
    await addressService.deleteAddress(req.user.id, id);
    res.json({ success: true, message: 'Address deleted', data: null });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to delete address' });
  }
}

export async function setDefaultAddress(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ success: false, data: null, message: 'Invalid address ID' }); return; }
    await addressService.setDefaultAddress(req.user.id, id);
    res.json({ success: true, message: 'Default address updated', data: null });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to set default address' });
  }
}
