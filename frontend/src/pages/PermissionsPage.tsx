import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { Agent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

const TOOLS = [
  'mock_search',
  'mock_database',
  'mock_file',
  'call_mock_api',
  'calculator'
];

export const PermissionsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.getAgents();
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
          AGENT PERMISSIONS & CLEARANCE MATRIX
        </h2>
        <p className="text-xs text-slate-400">Overview of tool execution permissions and security data access levels across all AI agents.</p>
      </div>

      {/* Permissions Matrix Card */}
      <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Tool Authorization Governance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300 border-collapse">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-3">Agent Name</th>
                <th className="p-3">Clearance Level</th>
                <th className="p-3">Max Calls</th>
                {TOOLS.map((t) => (
                  <th key={t} className="p-3 text-center">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">Loading matrix...</td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">No agents configured.</td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {agent.name}
                    </td>
                    <td className="p-3">
                      <SeverityBadge level={agent.data_access_level} />
                    </td>
                    <td className="p-3 text-slate-400 font-bold">{agent.max_tool_calls}</td>
                    {TOOLS.map((toolName) => {
                      const perm = agent.permissions.find((p) => p.tool_name === toolName);
                      const isAllowed = perm ? perm.is_allowed : false;
                      return (
                        <td key={toolName} className="p-3 text-center">
                          {isAllowed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                              ALLOWED
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-500 border border-slate-800">
                              DENIED
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
