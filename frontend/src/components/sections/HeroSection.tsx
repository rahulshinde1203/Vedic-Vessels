'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const ease = [0.25, 0.1, 0.25, 1] as const;

// Staggered text entrance helpers
function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  };
}

// ── Copper Vessel SVG ─────────────────────────────────────────────────────────

function CopperVessel() {
  return (
    <svg
      viewBox="0 0 100 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-36 h-36 md:w-44 md:h-44 drop-shadow-2xl"
    >
      <defs>
        <linearGradient id="copperBody" x1="0" y1="0" x2="100" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4943A" />
          <stop offset="45%"  stopColor="#B87333" />
          <stop offset="100%" stopColor="#7A4E2D" />
        </linearGradient>
        <linearGradient id="goldRim" x1="30" y1="5" x2="70" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#E6C97A" />
          <stop offset="100%" stopColor="#C6A85A" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="30" y1="115" x2="70" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#C6853A" />
          <stop offset="100%" stopColor="#6B3E1E" />
        </linearGradient>
        <radialGradient id="bodyHighlight" cx="35%" cy="38%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Base platform */}
      <ellipse cx="50" cy="125" rx="19" ry="4.5" fill="url(#baseGrad)" opacity="0.75" />
      <rect x="34" y="116" width="32" height="10" rx="3" fill="url(#baseGrad)" />

      {/* Main body (kalash belly) */}
      <path
        d="M29 102 C19 88 14 68 17 52 C20 36 30 23 36 19 L64 19 C70 23 80 36 83 52 C86 68 81 88 71 102 Z"
        fill="url(#copperBody)"
      />

      {/* Neck */}
      <path
        d="M39 19 C39 13 44 8 50 7 C56 8 61 13 61 19"
        fill="url(#copperBody)"
      />

      {/* Rim / mouth opening */}
      <ellipse cx="50" cy="7" rx="12.5" ry="4" fill="url(#goldRim)" />

      {/* Decorative gold bands */}
      <path d="M22 78 Q50 72 78 78" stroke="url(#goldRim)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <path d="M21 84 Q50 78 79 84" stroke="url(#goldRim)" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />

      {/* Light reflection highlight */}
      <ellipse cx="37" cy="58" rx="7" ry="18" fill="url(#bodyHighlight)" />
      <path
        d="M31 62 C29 52 30 42 34 33"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-brand-dark">

      {/* ── Background Layers ── */}
      <div className="absolute inset-0 bg-linear-to-br from-[#080604] via-brand-dark to-[#1A120B]" />

      {/* Radial glow — anchored left behind text */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse,rgba(198,168,90,0.07)_0%,transparent_68%)]" />
      </div>

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(rgba(198,168,90,0.12) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-screen py-28">

          {/* ─── LEFT: Text Content ─────────────────────────────────── */}
          <div className="flex flex-col items-start">

            {/* Eyebrow */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-9">
              <div className="h-px w-8 bg-brand-gold/55" />
              <span className="text-brand-gold text-[10px] tracking-[0.38em] uppercase font-medium">
                Est. 2020 &middot; Handcrafted in India
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              {...fadeUp(0.25)}
              className="font-serif text-5xl md:text-6xl xl:text-7xl text-white leading-[1.07] mb-6 tracking-tight"
            >
              Sacred Vessels<br />
              <span className="gold-gradient-text">for Sacred Rituals</span>
            </motion.h1>

            {/* Body */}
            <motion.p
              {...fadeUp(0.4)}
              className="text-white/45 text-lg max-w-lg mb-11 leading-relaxed font-light"
            >
              Handcrafted with devotion — brass, copper, and silver ritual items
              that elevate your spiritual practice and bring sacred energy home.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.55)} className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link href="/shop">
                <Button size="lg">Explore Sacred Collection</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">Our Story</Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.72 }}
              className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-white/8 pt-8"
            >
              {['100% Pure Metal', 'Artisan Made', 'Free Shipping ₹999+'].map((tag) => (
                <div key={tag} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-gold/55" />
                  <span className="text-[11px] text-white/35 tracking-wide">{tag}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ─── RIGHT: Product Visual ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.35, ease }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Ambient glow blobs */}
            <div className="absolute w-72 h-72 rounded-full bg-brand-gold/6 blur-3xl pointer-events-none" />
            <div className="absolute w-56 h-56 rounded-full bg-brand-copper/5 blur-2xl pointer-events-none" />

            {/* Floating vessel wrapper */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">

                {/* Slowly rotating dashed outer ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-5 rounded-full border border-dashed border-brand-gold/12"
                />

                {/* Static outer ring */}
                <div className="absolute inset-0 rounded-full border border-brand-gold/18" />

                {/* Counter-rotating inner accent ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-3 rounded-full border border-brand-gold/8"
                  style={{ borderTopColor: 'rgba(198,168,90,0.35)', borderTopWidth: '1.5px' }}
                />

                {/* Product frame */}
                <div className="absolute inset-6 rounded-full overflow-hidden bg-linear-to-br from-brand-surface to-brand-dark-brown flex items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]">
                  {/* Copper radial glow inside frame */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_35%,rgba(184,115,51,0.22)_0%,transparent_65%)] pointer-events-none" />
                  <CopperVessel />
                </div>

                {/* Accent dots at cardinal points */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 rounded-full bg-brand-gold/70" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 rounded-full bg-brand-gold/40" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 rounded-full bg-brand-gold/40" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-1.5 h-1.5 rounded-full bg-brand-gold/40" />
              </div>
            </motion.div>

            {/* Floating info card — top right */}
            <motion.div
              initial={{ opacity: 0, x: 18, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.95, ease }}
              className="hidden md:block absolute top-4 right-0 glass-card rounded-xl px-4 py-3 shadow-lg"
            >
              <p className="text-[10px] text-brand-gold tracking-widest uppercase font-medium">Pure Copper</p>
              <p className="text-xs text-white/55 mt-0.5">Artisan Handcrafted</p>
            </motion.div>

            {/* Floating info card — bottom left */}
            <motion.div
              initial={{ opacity: 0, x: -18, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1, ease }}
              className="hidden md:block absolute bottom-4 left-0 glass-card rounded-xl px-4 py-3 shadow-lg"
            >
              <p className="text-[10px] text-brand-gold tracking-widest uppercase font-medium">Starting ₹849</p>
              <p className="text-xs text-white/55 mt-0.5">Free shipping</p>
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-brand-gold/28 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-7 bg-linear-to-b from-brand-gold/28 to-transparent" />
      </div>
    </section>
  );
}
