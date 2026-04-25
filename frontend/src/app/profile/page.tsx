'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { getProfile, updateProfile, type UserProfile } from '@/services/user.service';

export default function ProfilePage() {
  const router = useRouter();
  const token  = useAuthStore((s) => s.token);

  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editing,  setEditing]  = useState(false);

  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [nameErr,  setNameErr]  = useState('');
  const [emailErr, setEmailErr] = useState('');

  useEffect(() => {
    if (!token) { router.replace('/login'); return; }
    getProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name ?? '');
        setEmail(p.email ?? '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [token, router]);

  const validate = (): boolean => {
    let ok = true;
    setNameErr('');
    setEmailErr('');
    if (!name.trim()) { setNameErr('Name is required'); ok = false; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailErr('Enter a valid email address'); ok = false;
    }
    return ok;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() });
      setProfile(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
    setNameErr('');
    setEmailErr('');
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 lg:py-12">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">Profile</span>
        </nav>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-charcoal to-gray-800 px-6 py-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 border-2 border-brand-gold/30 flex items-center justify-center shrink-0">
              <span className="text-brand-gold text-2xl font-bold">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : profile?.phone.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                {profile?.name ?? 'Your Account'}
              </p>
              <p className="text-white/60 text-sm mt-0.5">{profile?.phone}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* Phone — read-only */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200">
                <span className="text-gray-800 text-sm font-medium">{profile?.phone}</span>
                <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Cannot be changed
                </span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setNameErr(''); }}
                    placeholder="Rahul Shinde"
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all ${
                      nameErr ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
                    }`}
                  />
                  {nameErr && <p className="mt-1 text-[11px] text-red-500">{nameErr}</p>}
                </>
              ) : (
                <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800">
                  {profile?.name ?? <span className="text-gray-400 italic">Not set</span>}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              {editing ? (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                    placeholder="rahul@example.com"
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all ${
                      emailErr ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-brand-gold'
                    }`}
                  />
                  {emailErr && <p className="mt-1 text-[11px] text-red-500">{emailErr}</p>}
                </>
              ) : (
                <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800">
                  {profile?.email ?? <span className="text-gray-400 italic">Not set</span>}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:opacity-60 transition-colors"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2.5 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Quick links */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/profile/address"
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-gold/40 hover:shadow-sm transition-all group"
          >
            <span className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-lg shrink-0 group-hover:bg-amber-100 transition-colors">
              📍
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Saved Addresses</p>
              <p className="text-xs text-gray-400">Manage delivery addresses</p>
            </div>
          </Link>
          <Link
            href="/my-orders"
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-gold/40 hover:shadow-sm transition-all group"
          >
            <span className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-lg shrink-0 group-hover:bg-amber-100 transition-colors">
              📦
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">My Orders</p>
              <p className="text-xs text-gray-400">Track your orders</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
