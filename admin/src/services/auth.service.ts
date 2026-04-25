const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function post<T>(path: string, body: object): Promise<T> {
  const res  = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

export async function adminSendOtp(phone: string): Promise<{ otp?: string }> {
  return post('/auth/send-otp', { phone });
}

export async function adminVerifyOtp(
  phone: string,
  otp:   string,
): Promise<{ user: { id: number; phone: string; role: string }; token: string }> {
  return post('/auth/verify-otp', { phone, otp });
}
