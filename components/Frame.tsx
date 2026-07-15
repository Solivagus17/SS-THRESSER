'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FrameProps {
  children: React.ReactNode;
  transitioning: boolean;
}

export default function Frame({ children, transitioning }: FrameProps) {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    if (transitioning) {
      setFlicker(true);
      const t = setTimeout(() => setFlicker(false), 180);
      return () => clearTimeout(t);
    }
  }, [transitioning]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0d0a] p-4 overflow-hidden">
      {/* Outer CRT scanlines on body */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      {/* Flicker overlay */}
      <AnimatePresence>
        {flicker && (
          <motion.div
            key="flicker"
            className="pointer-events-none fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Terminal Bezel */}
      <div
        className="relative w-full max-w-5xl"
        style={{
          background: 'linear-gradient(160deg, #2a2f2a, #1c1f1e 60%)',
          boxShadow:
            '0 0 0 3px #000, 0 0 0 6px #3a3f3a, 0 0 0 9px #000, 0 30px 80px rgba(0,0,0,0.9)',
          padding: '20px',
          minHeight: '680px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Corner brackets */}
        {['tl', 'tr', 'bl', 'br'].map((pos) => (
          <div
            key={pos}
            className="absolute w-5 h-5"
            style={{
              top: pos.startsWith('t') ? 8 : undefined,
              bottom: pos.startsWith('b') ? 8 : undefined,
              left: pos.endsWith('l') ? 8 : undefined,
              right: pos.endsWith('r') ? 8 : undefined,
              borderTop: pos.startsWith('t') ? '2px solid #5a6a5a' : 'none',
              borderBottom: pos.startsWith('b') ? '2px solid #5a6a5a' : 'none',
              borderLeft: pos.endsWith('l') ? '2px solid #5a6a5a' : 'none',
              borderRight: pos.endsWith('r') ? '2px solid #5a6a5a' : 'none',
            }}
          />
        ))}

        {/* Plate */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
          <div
            className="font-mono text-[10px] tracking-[2px] px-3 py-1 border border-[#4a4f4a]"
            style={{ color: '#8a9a8a', background: '#0c100c', letterSpacing: '1px' }}
          >
            SS THRESHER — MAINT TERMINAL 07
          </div>
        </div>

        {/* Screen */}
        <div
          className="relative flex-1 flex flex-col overflow-hidden"
          style={{
            background: 'rgba(4,8,4,0.95)',
            border: '2px solid #000',
            minHeight: '640px',
          }}
        >
          {/* Internal scanlines */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                'repeating-linear-gradient(to bottom, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 2px, transparent 2px, transparent 5px)',
              opacity: 0.5,
            }}
          />
          {/* Internal vignette */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)',
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
