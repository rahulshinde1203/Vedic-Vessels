'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '/';
  const login        = useAuthStore((state) => state.login);

  const [step,    setStep]    = useState<Step>('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp,  setDevOtp]  = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error('Enter your phone number'); return; }
    setLoading(true);
    try {
      const data = await sendOtp(phone.trim());
      if (process.env.NODE_ENV === 'development') setDevOtp(data.otp);
      toast.success('OTP sent!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const data = await verifyOtp(phone.trim(), otp);
      login(data.user, data.token);
      toast.success('Logged in!');
      router.push(redirect);
    } catch (err: any) {
      toast.error(err.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-brand-gold text-3xl select-none">☽</span>
          <h1 className="mt-2 font-serif text-xl text-brand-charcoal">
            Vedic <span className="text-brand-gold">Vessels</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === 'phone' ? 'Sign in with your mobile number' : `OTP sent to ${phone}`}
          </p>
        </div>

        {/* ── Step 1: Phone ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">

            {/* Dev OTP hint */}
            {devOtp && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-center">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-1">
                  Dev — Your OTP
                </p>
                <p className="text-2xl font-bold text-amber-800 tracking-[0.4em]">{devOtp}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-center tracking-[0.5em] font-bold focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3 rounded-lg bg-brand-gold text-brand-charcoal text-sm font-bold hover:bg-brand-gold-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setDevOtp(null); }}
              className="w-full text-xs text-gray-400 hover:text-brand-gold transition-colors"
            >
              ← Change number
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing you agree to our{' '}
          <Link href="/" className="hover:text-brand-gold transition-colors">Terms & Privacy</Link>
        </p>

      </div>
    </div>
  );
}
