import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  PlusCircle,
  PlayCircle,
  ClipboardList,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  FileText,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/agents', label: 'AI Agents', icon: Bot },
    { to: '/agents/create', label: 'Create Agent', icon: PlusCircle },
    { to: '/testing', label: 'Security Testing', icon: PlayCircle },
    { to: '/results', label: 'Test Results', icon: ClipboardList },
    { to: '/events', label: 'Security Events', icon: AlertTriangle },
    { to: '/tool-calls', label: 'Tool Calls Log', icon: Terminal },
    { to: '/permissions', label: 'Agent Permissions', icon: ShieldCheck },
    { to: '/reports', label: 'Security Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Governance & Monitoring
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          SOC Security Baseline
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2">
          Controlled local evaluation. No real external system attacks performed.
        </p>
      </div>
    </aside>
  );
};
