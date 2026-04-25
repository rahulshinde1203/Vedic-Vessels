'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/auth.store';
import { adminSendOtp, adminVerifyOtp } from '@/services/auth.service';

type Step = 'phone' | 'otp';

export default function AdminLoginPage() {
  const router = useRouter();
  const login  = useAdminStore((s) => s.login);

  const [step,        setStep]        = useState<Step>('phone');
  const [phone,       setPhone]       = useState('');
  const [otp,         setOtp]         = useState('');
  const [devOtp,      setDevOtp]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError('Enter your phone number'); return; }
    setLoading(true);
    try {
      const res = await adminSendOtp(phone.trim());
      if (res.otp) setDevOtp(res.otp); // dev mode hint
      setStep('otp');
    } catch (err: any) {
      setError(err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Enter the OTP'); return; }
    setLoading(true);
    try {
      const res = await adminVerifyOtp(phone.trim(), otp.trim());
      if (res.user.role !== 'ADMIN') {
        setError('This account does not have admin access.');
        return;
      }
      login(res.user, res.token);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-brand-gold text-3xl">☽</span>
          <p className="text-white text-lg font-semibold mt-2">Vedic Vessels</p>
          <p className="text-slate-500 text-xs tracking-widest uppercase mt-0.5">Admin Panel</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-white/[0.08] p-6">
          <h1 className="text-white text-sm font-semibold mb-5">
            {step === 'phone' ? 'Sign in to Admin' : 'Enter OTP'}
          </h1>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/[0.1] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-brand-gold text-slate-900 text-sm font-bold hover:bg-brand-gold-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-slate-400 text-xs">
                OTP sent to <span className="text-white font-medium">{phone}</span>
              </p>

              {devOtp && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5">
                  <p className="text-amber-400 text-xs font-mono">Dev OTP: {devOtp}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-white/[0.1] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-gold transition-colors tracking-widest font-mono"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-brand-gold text-slate-900 text-sm font-bold hover:bg-brand-gold-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); setDevOtp(''); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to phone
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
