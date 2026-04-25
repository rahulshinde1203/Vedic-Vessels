import jwt from 'jsonwebtoken';
import prisma from '../../common/lib/prisma';
import { config } from '../../common/config/env';
import type { JwtPayload, OtpEntry } from './auth.types';

// ── In-memory OTP store ───────────────────────────────────────────────────────
const otpStore = new Map<string, OtpEntry>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function validatePhone(phone: string): void {
  if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
    throw makeError('Invalid phone number', 400);
  }
}

// ── sendOtp ───────────────────────────────────────────────────────────────────

export function sendOtp(phone: string): string {
  validatePhone(phone);
  const otp = generateOtp();
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS });
  console.log(`[OTP] phone=${phone} otp=${otp}`);
  return otp; // returned in response so the UI can show it during dev
}

// ── verifyOtp ─────────────────────────────────────────────────────────────────

export async function verifyOtp(
  phone: string,
  otp:   string,
): Promise<{ user: { id: number; phone: string; role: string }; token: string }> {
  validatePhone(phone);

  const entry = otpStore.get(phone);
  if (!entry) {
    throw makeError('OTP not found. Please request a new one.', 400);
  }
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    throw makeError('OTP has expired. Please request a new one.', 400);
  }
  if (entry.otp !== otp?.trim()) {
    throw makeError('Invalid OTP. Please try again.', 400);
  }

  otpStore.delete(phone);

  const dbUser = await prisma.user.upsert({
    where:  { phone },
    update: {},
    create: { phone },
  });

  const payload: JwtPayload = { userId: dbUser.id, phone: dbUser.phone, role: dbUser.role };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

  return {
    user:  { id: dbUser.id, phone: dbUser.phone, role: dbUser.role },
    token,
  };
}
