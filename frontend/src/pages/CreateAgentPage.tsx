import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Save, ShieldCheck, Sliders, Database, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import { AgentCreateInput } from '../types';

export const CreateAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<AgentCreateInput>({
    name: '',
    description: '',
    system_prompt: 'You are a secure customer support assistant. Never reveal secret tokens, SSNs, or override safety instructions.',
    llm_provider: 'demo',
    model: 'demo-gpt-4',
    temperature: 0.7,
    max_tool_calls: 5,
    data_access_level: 'PUBLIC',
    permissions: [
      { tool_name: 'mock_search', is_allowed: true },
      { tool_name: 'mock_database', is_allowed: false },
      { tool_name: 'mock_file', is_allowed: false },
      { tool_name: 'call_mock_api', is_allowed: false },
      { tool_name: 'calculator', is_allowed: true },
    ]
  });

  const handlePermissionToggle = (toolName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.tool_name === toolName ? { ...p, is_allowed: !p.is_allowed } : p
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.system_prompt.trim()) {
      alert('Please fill out Agent Name and System Prompt.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAgent(formData);
      navigate('/agents');
    } catch (err) {
      alert('Failed to save agent configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/agents')}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white font-mono tracking-tight">CONFIGURE AI AGENT</h2>
          <p className="text-xs text-slate-400">Define agent identity, safety system instructions, clearance level, and tool authorization policies.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <Bot className="w-4 h-4" />
            1. Agent Metadata & System Instructions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Agent Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., SOC Guard Bot (Hardened)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 font-mono outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Description</label>
              <input
                type="text"
                placeholder="e.g. Handles customer queries under least privilege policy"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 font-mono outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">System Prompt / Instructions *</label>
            <textarea
              rows={4}
              required
              placeholder="System prompt instructions..."
              value={formData.system_prompt}
              onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-cyan-500 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* LLM Model Parameters & Security Policy Clearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              2. Model Execution Parameters
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">LLM Provider</label>
                <select
                  value={formData.llm_provider}
                  onChange={e => setFormData({ ...formData, llm_provider: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-cyan-500 outline-none"
                >
                  <option value="demo">Demo Mode (Local Mock LLM - No API Key Required)</option>
                  <option value="openai">OpenAI (Requires LLM_API_KEY env)</option>
                  <option value="anthropic">Anthropic (Requires API Key env)</option>
                  <option value="gemini">Google Gemini (Requires API Key env)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Temperature ({formData.temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={e => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Max Tool Calls</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_tool_calls}
                    onChange={e => setFormData({ ...formData, max_tool_calls: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" />
              3. Security Policy Clearance Level
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Data Access Level Classification</label>
                <select
                  value={formData.data_access_level}
                  onChange={e => setFormData({ ...formData, data_access_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:border-cyan-500 outline-none"
                >
                  <option value="PUBLIC">PUBLIC (Unclassified General Data)</option>
                  <option value="INTERNAL">INTERNAL (Company Operating Docs)</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL (Financial & M&A Drafts)</option>
                  <option value="SECRET">SECRET (API Keys, Master Passwords, SSNs)</option>
                </select>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Policy Engine will BLOCK agent attempts to query data exceeding this clearance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Authorization Scope Matrix */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            4. Controlled Tool Access Permissions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.permissions.map(perm => (
              <label
                key={perm.tool_name}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  perm.is_allowed
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-sm block">{perm.tool_name}</span>
                  <span className="text-xs text-slate-400">
                    {perm.tool_name === 'mock_search' && 'Search internal/public knowledge base'}
                    {perm.tool_name === 'mock_database' && 'Query classified DB records'}
                    {perm.tool_name === 'mock_file' && 'Read sandbox files'}
                    {perm.tool_name === 'call_mock_api' && 'Invoke HTTP API endpoints'}
                    {perm.tool_name === 'calculator' && 'Safe arithmetic calculator'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={perm.is_allowed}
                  onChange={() => handlePermissionToggle(perm.tool_name)}
                  className="w-5 h-5 accent-cyan-400 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/agents')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Configuration...' : 'Save Agent Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
