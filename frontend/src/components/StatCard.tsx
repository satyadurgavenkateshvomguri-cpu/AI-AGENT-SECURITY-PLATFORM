import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'red' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan'
}) => {
  const colorMap = {
    cyan: 'from-cyan-500/10 to-blue-500/5 text-cyan-400 border-cyan-500/20',
    red: 'from-red-500/10 to-rose-500/5 text-red-400 border-red-500/20',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/10 to-yellow-500/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/10 to-indigo-500/5 text-purple-400 border-purple-500/20',
  };

  const iconBg = {
    cyan: 'bg-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/20 text-red-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color]} border backdrop-blur-md flex items-start justify-between relative overflow-hidden`}>
      <div className="space-y-1 z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="text-3xl font-extrabold text-white font-mono tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconBg[color]} z-10`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
