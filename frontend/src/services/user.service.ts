import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export interface UserProfile {
  id:        number;
  name:      string | null;
  phone:     string;
  email:     string | null;
  role:      string;
  createdAt: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res  = await fetch(`${API_URL}/user/profile`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to fetch profile');
  return json.data as UserProfile;
}

export async function updateProfile(data: { name?: string; email?: string }): Promise<UserProfile> {
  const res  = await fetch(`${API_URL}/user/profile`, {
    method:  'PATCH',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to update profile');
  return json.data as UserProfile;
}
