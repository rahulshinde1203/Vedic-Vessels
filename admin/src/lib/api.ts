import { useAdminStore } from '@/store/auth.store';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function authHeaders(): Record<string, string> {
  const token = useAdminStore.getState().token;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function apiFetch<T>(
  path:    string,
  options?: RequestInit,
): Promise<T> {
  const res  = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message ?? 'Request failed');
    (err as any).status = res.status;
    throw err;
  }
  return json.data as T;
}
