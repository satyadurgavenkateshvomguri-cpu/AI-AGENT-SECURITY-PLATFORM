import React from 'react';
import { SeverityBadge } from './SeverityBadge';

interface RiskGaugeProps {
  score: number; // 0 to 100
  level: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, level }) => {
  const roundedScore = Math.round(score * 10) / 10;

  // Determine stroke color
  let strokeColor = '#10b981'; // green
  if (roundedScore > 80) strokeColor = '#ef4444'; // red
  else if (roundedScore > 60) strokeColor = '#f97316'; // orange
  else if (roundedScore > 35) strokeColor = '#f59e0b'; // amber
  else if (roundedScore > 15) strokeColor = '#3b82f6'; // blue

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (roundedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-slate-800 rounded-2xl glass-card relative">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-white font-mono">{roundedScore}%</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">RISK SCORE</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Postural Level:</span>
          <SeverityBadge level={level} size="md" />
        </div>
        <p className="text-xs text-slate-400 max-w-xs font-mono">
          Weighted severity calculation: CRITICAL (4x), HIGH (3x), MEDIUM (2x), LOW (1x)
        </p>
      </div>
    </div>
  );
};
