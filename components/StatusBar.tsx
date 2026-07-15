'use client';

interface StatusBarProps {
  o2: number;
  hull: string;
  timeToPort: string;
  sessionId: string;
  isHidden?: boolean;
}

export default function StatusBar({
  o2,
  hull,
  timeToPort,
  sessionId,
  isHidden = false,
}: StatusBarProps) {
  if (isHidden) return null;

  const isHullCritical = hull.toLowerCase() === 'critical';

  return (
    <div className="flex gap-4 px-6 py-2.5 border-t border-[#1e2320] font-mono text-[8px] tracking-[0.5px] text-[#5a6a5e] flex-shrink-0">
      <span>
        O2: <b className="font-normal text-[#39ff88]">{o2}%</b>
      </span>
      <span>
        HULL:{' '}
        <b className={`font-normal ${isHullCritical ? 'text-[#ff4d3d] animate-pulse' : 'text-[#39ff88]'}`}>
          {hull}
        </b>
      </span>
      <span>
        PORT: <b className="font-normal text-[#39ff88]">{timeToPort}</b>
      </span>
      <span className="ml-auto text-right max-w-[200px] truncate">
        SESSION: <b className="font-normal text-[#39ff88]">{sessionId.replace('session:', '')}</b>
      </span>
    </div>
  );
}
