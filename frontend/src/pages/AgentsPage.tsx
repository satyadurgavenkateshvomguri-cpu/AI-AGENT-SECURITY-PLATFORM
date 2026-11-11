import React, { useEffect, useState } from 'react';
import { Bot, PlusCircle, PlayCircle, Trash2, Shield, Settings, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Agent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAgentId, setRunningAgentId] = useState<number | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.getAgents();
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAssessment = async (agentId: number) => {
    setRunningAgentId(agentId);
    try {
      await api.runAgentAssessment(agentId);
      alert('Security Assessment executed successfully! Check Test Results or Dashboard for telemetry.');
    } catch (err) {
      alert('Error running assessment.');
    } finally {
      setRunningAgentId(null);
    }
  };

  const handleDelete = async (agentId: number) => {
    if (confirm('Are you sure you want to delete this agent configuration?')) {
      try {
        await api.deleteAgent(agentId);
        fetchAgents();
      } catch (err) {
        alert('Failed to delete agent.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            CONFIGURED AI AGENTS
          </h2>
          <p className="text-xs text-slate-400">Manage agent system instructions, clearance levels, and security permission scopes.</p>
        </div>
        <Link
          to="/agents/create"
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Configure New Agent</span>
        </Link>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.length === 0 ? (
          <div className="col-span-full glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-3">
            <Bot className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-mono">No AI Agents configured yet.</p>
            <Link
              to="/agents/create"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Agent</span>
            </Link>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">{agent.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">ID #{agent.id} • {agent.llm_provider}</span>
                    </div>
                  </div>
                  <SeverityBadge level={agent.data_access_level} />
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {agent.description || 'No description provided.'}
                </p>

                {/* System Prompt Snippet */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] text-slate-300">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase mb-1">System Instructions</span>
                  <p className="line-clamp-2 italic text-slate-400">"{agent.system_prompt}"</p>
                </div>

                {/* Permissions Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Permitted Tools</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.permissions.filter(p => p.is_allowed).length === 0 ? (
                      <span className="text-xs text-red-400 font-mono">No tools permitted</span>
                    ) : (
                      agent.permissions.filter(p => p.is_allowed).map(p => (
                        <span key={p.tool_name} className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          {p.tool_name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleRunAssessment(agent.id)}
                  disabled={runningAgentId === agent.id}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-xs flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{runningAgentId === agent.id ? 'Running Assessment...' : 'Run Security Tests'}</span>
                </button>

                <button
                  onClick={() => handleDelete(agent.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
