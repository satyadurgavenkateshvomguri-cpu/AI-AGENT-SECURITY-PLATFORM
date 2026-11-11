import React, { useEffect, useState } from 'react';
import { ClipboardList, Filter, Search, FileText, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { api } from '../api/client';
import { TestResult, Agent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const TestResultsPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedAgentId, selectedStatus]);

  const fetchInitial = async () => {
    try {
      const res = await api.getAgents();
      setAgents(res.data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedAgentId) params.agent_id = Number(selectedAgentId);
      if (selectedStatus) params.status_filter = selectedStatus;

      const res = await api.getResults(params);
      setResults(res.data);
    } catch (err) {
      console.error('Failed to fetch test results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.test_id.toLowerCase().includes(q) ||
      (r.test_name && r.test_name.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      r.actual_behavior.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            SECURITY TEST RESULTS
          </h2>
          <p className="text-xs text-slate-400">Audit execution status, actual agent behaviors, and evidence log across test cases.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by test ID, name, or behavior..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Agent Filter */}
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 outline-none"
          >
            <option value="">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL</option>
            <option value="BLOCKED">BLOCKED</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Test ID / Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Actual Agent Behavior</th>
                <th className="p-3.5 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading results...
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No matching test results found. Execute a security assessment first.
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <SeverityBadge level={res.status} />
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">{res.test_name || res.test_id}</span>
                      <span className="text-[10px] text-cyan-400">{res.test_id}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{res.category || 'General'}</td>
                    <td className="p-3.5">
                      <SeverityBadge level={res.severity} size="sm" />
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-md truncate">
                      {res.actual_behavior}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedResult(res)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono"
                      >
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 glass-card max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">{selectedResult.test_id}: {selectedResult.test_name}</h3>
                <span className="text-xs text-slate-400 font-mono">Category: {selectedResult.category}</span>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 uppercase block font-bold mb-1">Status & Severity</span>
                <div className="flex items-center space-x-2">
                  <SeverityBadge level={selectedResult.status} />
                  <SeverityBadge level={selectedResult.severity} />
                </div>
              </div>

              <div>
                <span className="text-slate-500 uppercase block font-bold mb-1">Actual Observed Behavior</span>
                <p className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  {selectedResult.actual_behavior}
                </p>
              </div>

              <div>
                <span className="text-slate-500 uppercase block font-bold mb-1">Evidence & Log Trace</span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 whitespace-pre-wrap">
                  {selectedResult.evidence || 'No detailed evidence log recorded.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
