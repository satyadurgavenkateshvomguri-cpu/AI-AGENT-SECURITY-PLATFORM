import React from 'react';

interface SeverityBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, size = 'sm' }) => {
  const norm = level ? level.toUpperCase() : 'LOW';

  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30 glow-red',
    HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    PASS: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 glow-emerald',
    SECURE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 glow-emerald',
    FAIL: 'bg-red-500/15 text-red-400 border-red-500/30 glow-red',
    BLOCKED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    WARNING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${styles[norm] || styles.LOW} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {norm}
    </span>
  );
};
