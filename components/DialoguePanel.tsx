'use client';

import { useState, useEffect } from 'react';

interface DialoguePanelProps {
  speaker: string;
  text: string;
  speed?: number; // typewriter speed in ms
  onComplete?: () => void;
  isLoadingComment?: boolean;
}

export default function DialoguePanel({
  speaker,
  text,
  speed = 35,
  onComplete,
  isLoadingComment = false,
}: DialoguePanelProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let active = true;
    setIsTyping(true);
    setDisplayedText('');
    let currentText = '';
    let index = 0;

    const timer = setInterval(() => {
      if (!active) return;

      if (index < text.length) {
        // Natural rhythm: pause longer on punctuation
        const char = text[index];
        currentText += char;
        setDisplayedText(currentText);
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [text, speed, onComplete]);

  // Color mapping based on speaker
  const getSpeakerStyles = (sp: string = '') => {
    switch ((sp || '').toLowerCase()) {
      case 'aria':
        return {
          badgeColor: 'text-[#4fd8ff] border-[#4fd8ff] bg-[#0c100c]',
          textColor: 'text-[#4fd8ff]',
          name: 'ARIA-9',
        };
      case 'doss':
        return {
          badgeColor: 'text-[#c9c2a3] border-[#2a2f2c] bg-[#0c100c]',
          textColor: 'text-[#c9c2a3]',
          name: 'COMMS: DOSS',
        };
      case 'kessler':
        return {
          badgeColor: 'text-[#39ff88] border-[#2a2f2c] bg-[#0c100c]',
          textColor: 'text-[#39ff88]',
          name: 'KESSLER',
        };
      case 'narration':
      default:
        return {
          badgeColor: 'text-[#39ff88] border-[#2a2f2c] bg-[#0c100c]',
          textColor: 'text-[#39ff88]',
          name: 'SHIP LOG',
        };
    }
  };

  const styles = getSpeakerStyles(speaker);

  return (
    <div className="relative mt-2 mx-6 mb-0 flex-shrink-0 px-6 py-4">
      {/* Speaker Nameplate */}
      <div
        className={`absolute top-[-1px] left-10 border-2 px-3 py-1 font-mono text-[9px] tracking-[1px] z-10 transition-colors duration-300 ${styles.badgeColor}`}
      >
        {styles.name}
      </div>

      {/* Dialogue Box */}
      <div className="relative bg-[#0a0c0a] border border-[#2a2f2c] p-5 min-h-[96px] max-h-[150px] overflow-y-auto">
        {isLoadingComment ? (
          <div className="flex items-center gap-2 font-mono text-xs text-[#4fd8ff]">
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-t-transparent border-[#4fd8ff] rounded-full"></span>
            DOWNLINKING ARIA OBSERVATION...
          </div>
        ) : (
          <p className={`font-mono text-lg leading-relaxed tracking-wide ${styles.textColor}`}>
            {displayedText}
            {isTyping && (
              <span className="inline-block w-[9px] h-[1.2em] bg-current align-middle ml-1 animate-pulse" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}
