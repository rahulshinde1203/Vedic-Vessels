import { Request, Response } from 'express';
import * as userService from './user.service';

function noAuth(res: Response) {
  res.status(401).json({ success: false, data: null, message: 'Authentication required' });
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const user = await userService.getProfile(req.user.id);
    res.json({ success: true, message: 'Profile fetched', data: user });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to fetch profile' });
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) { noAuth(res); return; }
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err: any) {
    res.status(err?.statusCode ?? 500).json({ success: false, data: null, message: err?.message ?? 'Failed to update profile' });
  }
}
