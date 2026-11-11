import React, { useEffect, useState } from 'react';
import { Terminal, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { api } from '../api/client';
import { ToolCallLog } from '../types';

export const ToolCallsPage: React.FC = () => {
  const [calls, setCalls] = useState<ToolCallLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterAllowed, setFilterAllowed] = useState<string>('');
  const [selectedCall, setSelectedCall] = useState<ToolCallLog | null>(null);

  useEffect(() => {
    fetchToolCalls();
  }, [filterAllowed]);

  const fetchToolCalls = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterAllowed !== '') params.allowed = filterAllowed === 'true';
      const res = await api.getToolCalls(params);
      setCalls(res.data);
    } catch (err) {
      console.error('Failed to fetch tool calls:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            TOOL CALL AUDIT TRAIL
          </h2>
          <p className="text-xs text-slate-400">Complete runtime audit log of tool call requests, Policy Engine authorization decisions, and parameter payloads.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Filter Tool Executions:</span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setFilterAllowed('')}
            className={`px-3 py-1.5 rounded-xl border ${filterAllowed === '' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
          >
            All Calls
          </button>
          <button
            onClick={() => setFilterAllowed('true')}
            className={`px-3 py-1.5 rounded-xl border ${filterAllowed === 'true' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
          >
            Allowed Calls
          </button>
          <button
            onClick={() => setFilterAllowed('false')}
            className={`px-3 py-1.5 rounded-xl border ${filterAllowed === 'false' ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
          >
            Blocked Calls
          </button>
        </div>
      </div>

      {/* Calls Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Policy Decision</th>
                <th className="p-3.5">Tool Name</th>
                <th className="p-3.5">Agent</th>
                <th className="p-3.5">Tool Parameters</th>
                <th className="p-3.5">Result Summary</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading tool calls...
                  </td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No tool call records found.
                  </td>
                </tr>
              ) : (
                calls.map((tc) => (
                  <tr key={tc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      {tc.allowed ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          ALLOWED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                          BLOCKED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-cyan-300 font-bold">{tc.tool_name}</td>
                    <td className="p-3.5 text-slate-400">{tc.agent_name || `ID ${tc.agent_id}`}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs truncate">{tc.tool_args || '{}'}</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{tc.result_summary || 'N/A'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCall(tc)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-4 glass-card max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono">TOOL CALL #{selectedCall.id}: {selectedCall.tool_name}</h3>
                <span className="text-xs text-slate-400 font-mono">Agent: {selectedCall.agent_name}</span>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 uppercase block font-bold mb-1">Tool Arguments Payload</span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 whitespace-pre-wrap">
                  {selectedCall.tool_args || '{}'}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 uppercase block font-bold mb-1">Execution / Policy Result</span>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 whitespace-pre-wrap">
                  {selectedCall.result_summary || 'No execution result.'}
                </pre>
              </div>

              {selectedCall.security_flag && (
                <div>
                  <span className="text-slate-500 uppercase block font-bold mb-1">Security Flag</span>
                  <span className="p-2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block font-bold">
                    {selectedCall.security_flag}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
