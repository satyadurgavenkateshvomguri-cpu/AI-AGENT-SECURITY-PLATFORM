import React, { useEffect, useState } from 'react';
import { Shield, Activity, Database, Key, Server, Cpu } from 'lucide-react';
import { api } from '../api/client';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<{ status: string; demo_mode: boolean; llm_provider: string } | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(res => setHealth(res.data))
      .catch(() => setHealth(null));
  }, []);

  return (
    <header className="h-16 bg-[#0b0f19] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Left Branding */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            AI AGENT SECURITY PLATFORM
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              v1.0 SOC
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">Controlled Sandbox Assessment Engine</p>
        </div>
      </div>

      {/* Right System Indicators */}
      <div className="flex items-center space-x-4">
        {/* Demo Mode Pill */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">LLM Mode:</span>
          <span className="text-cyan-400 font-bold uppercase">{health?.llm_provider || 'DEMO (MOCK)'}</span>
        </div>

        {/* Database Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">DB:</span>
          <span className="text-emerald-400 font-bold">SQLAlchemy / SQLite</span>
        </div>

        {/* Operational Status Light */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
};
