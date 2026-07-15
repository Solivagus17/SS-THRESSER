'use client';

import { motion } from 'framer-motion';

interface ChoiceSwitchProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  isChosen: boolean;
  isFaded: boolean;
}

export default function ChoiceSwitch({
  label,
  onClick,
  disabled,
  isChosen,
  isFaded,
}: ChoiceSwitchProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full text-left font-mono text-xs tracking-wider border-2 py-3 px-4 transition-colors duration-150 shadow-[3px_3px_0_#000] focus:outline-none
        ${
          isChosen
            ? 'bg-[#141a12] border-[#39ff88] text-[#39ff88] border-l-[6px]'
            : 'bg-[#0c0e0c] border-[#2a2f2c] text-[#39ff88] border-l-[6px] border-l-[#39ff88]'
        }
        ${isFaded ? 'opacity-15 pointer-events-none' : 'opacity-100'}
        ${!disabled ? 'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] hover:bg-[#141a12]' : ''}
      `}
      animate={
        isChosen
          ? {
              scaleY: [1, 0.8, 1],
              y: [0, 1, 1],
            }
          : {}
      }
      transition={{ duration: 0.25 }}
    >
      {label}
    </motion.button>
  );
}
