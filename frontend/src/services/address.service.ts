import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export interface AddressInput {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  state:    string;
  pincode:  string;
}

export interface SavedAddress extends AddressInput {
  id:        number;
  userId:    number;
  createdAt: string;
}

export async function saveAddress(data: AddressInput): Promise<SavedAddress> {
  const res  = await fetch(`${API_URL}/address`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to save address');
  return json.data as SavedAddress;
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const res  = await fetch(`${API_URL}/address`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? 'Failed to fetch addresses');
  return json.data as SavedAddress[];
}
