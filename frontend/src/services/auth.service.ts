import type { AuthUser } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendOtp(phone: string): Promise<{ otp: string }> {
  const res  = await fetch(`${API_URL}/auth/send-otp`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to send OTP');
  return json.data as { otp: string };
}

export async function verifyOtp(
  phone: string,
  otp:   string,
): Promise<{ user: AuthUser; token: string }> {
  const res  = await fetch(`${API_URL}/auth/verify-otp`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ phone, otp }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to verify OTP');
  return json.data as { user: AuthUser; token: string };
}
