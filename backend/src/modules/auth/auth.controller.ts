import { Request, Response } from 'express';
import * as authService from './auth.service';
import type { SendOtpBody, VerifyOtpBody } from './auth.types';

export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { phone } = req.body as SendOtpBody;
    const otp = authService.sendOtp(phone);
    res.json({ success: true, message: 'OTP sent', data: { otp } });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Failed to send OTP';
    res.status(status).json({ success: false, data: null, message });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { phone, otp } = req.body as VerifyOtpBody;
    const result = await authService.verifyOtp(phone, otp);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'OTP verification failed';
    if (status === 500) console.error('[Auth] unexpected error:', err);
    res.status(status).json({ success: false, data: null, message });
  }
}
