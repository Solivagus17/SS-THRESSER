'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface CharacterPortraitProps {
  character: 'kessler' | 'doss' | 'none';
  isActive: boolean;
  isOffline?: boolean;
}

export default function CharacterPortrait({
  character,
  isActive,
  isOffline = false,
}: CharacterPortraitProps) {
  if (character === 'none') return null;

  const src = character === 'kessler' ? '/characters/kessler.png' : '/characters/doss.png';
  const name = character === 'kessler' ? 'Kessler' : 'Doss';
  const isLeft = character === 'kessler';

  // Proportional sizing: Kessler is scaled down, Doss is slightly larger
  const width = isLeft ? 150 : 180;
  const height = isLeft ? 220 : 255;

  // Glow shadow styling
  const activeGlow = isLeft
    ? 'drop-shadow-[0_0_18px_rgba(79,216,255,0.55)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]'
    : 'drop-shadow-[0_0_18px_rgba(185,103,255,0.55)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]';

  const offlineFilter = 'grayscale(1) brightness(0.35) drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)]';

  return (
    <motion.div
      className={`absolute bottom-[108px] z-30 select-none pointer-events-none ${
        isLeft ? 'left-8' : 'right-8'
      }`}
      style={{ width: `${width}px`, height: `${height}px` }}
      initial={{ x: isLeft ? -300 : 300, opacity: 0 }}
      animate={{
        x: isActive ? 0 : isLeft ? -300 : 300,
        opacity: isActive ? 1 : 0,
      }}
      transition={{
        opacity: { duration: 0.55, ease: [0.25, 0, 0.35, 1] },
        x: { duration: 0.65, ease: [0.22, 1.4, 0.36, 1] },
      }}
    >
      <div 
        className="relative flex items-end justify-center w-full h-full"
      >
        <Image
          src={src}
          alt={name}
          width={width}
          height={height}
          priority
          className={`object-contain object-bottom pixelated transition-all duration-500
            ${isActive && !isOffline ? activeGlow : ''}
          `}
          style={{
            filter: isOffline ? offlineFilter : undefined,
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      </div>
    </motion.div>
  );
}
