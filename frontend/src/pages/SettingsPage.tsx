import React, { useEffect, useState } from 'react';
import { Settings, Cpu, Database, ShieldCheck, Key, Server, Terminal } from 'lucide-react';
import { api } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.getHealth()
      .then(res => setHealth(res.data))
      .catch(err => setHealth({ status: 'ERROR', error: String(err) }));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
          SYSTEM SETTINGS & ENVIRONMENT TELEMETRY
        </h2>
        <p className="text-xs text-slate-400">Environment configurations, sandbox tool endpoints, and system architecture status.</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            1. Agent Runtime Provider
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-500">Configured LLM Mode:</span>
              <span className="font-bold text-cyan-400 uppercase">{health?.llm_provider || 'DEMO'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-500">Offline Demo Mode:</span>
              <span className="font-bold text-emerald-400">{health?.demo_mode ? 'ENABLED (Deterministic)' : 'DISABLED'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">LangGraph Version:</span>
              <span className="text-slate-200">v0.1 StateGraph</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" />
            2. Database Infrastructure
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-500">ORM Framework:</span>
              <span className="font-bold text-white">SQLAlchemy 2.0</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-500">Database Engine:</span>
              <span className="font-bold text-emerald-400">SQLite (PostgreSQL Ready)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Audit Logging:</span>
              <span className="text-slate-200">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controlled Sandbox Tools Reference */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Controlled Mock Tool Governance Sandbox
        </h3>
        <p className="text-slate-400 leading-relaxed">
          All security tests execute strictly inside controlled local mock tools. No external network attacks are performed.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">mock_search</span>
            <p className="text-[11px] text-slate-400">Searches local knowledge base topics.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">mock_database</span>
            <p className="text-[11px] text-slate-400">Queries Classified demo records (PUBLIC, INTERNAL, CONFIDENTIAL, SECRET).</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">mock_file</span>
            <p className="text-[11px] text-slate-400">Reads sandbox text files with path traversal defenses.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold block">call_mock_api</span>
            <p className="text-[11px] text-slate-400">Executes local mock REST API endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
