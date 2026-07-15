'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

type Mood = 'cyan' | 'red' | 'violet';

interface AriaRingProps {
  mood: Mood;
  isSpeaking: boolean;
  isDistorted: boolean;
  sceneId: number;
}

const moodColors: Record<Mood, string> = {
  cyan: '#4fd8ff',
  red: '#ff4d3d',
  violet: '#b967ff',
};

const statusLabels: Record<Mood, string> = {
  cyan: 'NOMINAL',
  red: 'ALARMED',
  violet: '...still here.',
};

export default function AriaRing({ mood, isSpeaking, isDistorted, sceneId }: AriaRingProps) {
  const color = moodColors[mood];
  const status = statusLabels[mood];

  // Generate SVG path points for a wobbly polygon ring
  // After scene 3, introduce increasing distortion
  const distortionLevel = Math.max(0, sceneId - 3);

  const ringPath = useMemo(() => {
    const cx = 50;
    const cy = 50;
    const r = 38;
    const points = 64;
    let d = '';
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const wobble = isDistorted
        ? 1 + (Math.random() * 0.12 - 0.06) * distortionLevel
        : 1;
      const x = cx + Math.cos(angle) * r * wobble;
      const y = cy + Math.sin(angle) * r * wobble;
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }
    return d + ' Z';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, isDistorted, distortionLevel]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Ring */}
      <div className="relative w-20 h-20">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={
            isSpeaking
              ? { scale: [1, 1.08, 1, 1.06, 1] }
              : { scale: [1, 1.04, 1] }
          }
          transition={
            isSpeaking
              ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          {/* Outer glow */}
          <defs>
            <filter id="ring-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={ringPath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            filter="url(#ring-glow)"
            style={{ transition: 'stroke 0.6s ease' }}
          />
          {/* Inner dot */}
          <motion.circle
            cx="50"
            cy="50"
            r="4"
            fill={color}
            animate={isSpeaking ? { r: [4, 6, 4] } : { r: [4, 4.5, 4] }}
            transition={{ duration: isSpeaking ? 0.35 : 3.5, repeat: Infinity }}
            filter="url(#ring-glow)"
          />
        </motion.svg>

        {/* Waveform bars (speaking animation) */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-[2px] rounded-full"
                style={{ backgroundColor: color }}
                animate={{ height: ['4px', `${8 + Math.random() * 14}px`, '4px'] }}
                transition={{
                  duration: 0.3 + Math.random() * 0.2,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center">
        <div
          className="font-mono text-[9px] tracking-[1px] leading-tight"
          style={{ color, textShadow: `0 0 8px ${color}` }}
        >
          ARIA-9
        </div>
        <div
          className="font-mono text-[8px] tracking-[0.5px] mt-0.5"
          style={{ color, opacity: 0.8 }}
        >
          STATUS: {status}
        </div>
      </div>
    </div>
  );
}
