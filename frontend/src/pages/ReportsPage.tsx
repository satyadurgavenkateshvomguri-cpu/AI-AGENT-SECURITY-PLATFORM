import React, { useEffect, useState } from 'react';
import { FileText, Download, Printer, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Agent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

export const ReportsPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.getAgents();
      setAgents(res.data);
      if (res.data.length > 0) {
        setSelectedAgentId(res.data[0].id);
        fetchReport(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const fetchReport = async (agentId: number) => {
    setLoading(true);
    try {
      const res = await api.getReportJson(agentId);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentChange = (id: number) => {
    setSelectedAgentId(id);
    fetchReport(id);
  };

  const handleOpenPrintableReport = () => {
    if (!selectedAgentId) return;
    const url = api.getReportHtmlUrl(Number(selectedAgentId));
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            SECURITY ASSESSMENT REPORTS
          </h2>
          <p className="text-xs text-slate-400">Generate executive summary reports, detailed findings, and remediation roadmaps for stakeholders.</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedAgentId}
            onChange={(e) => handleAgentChange(Number(e.target.value))}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenPrintableReport}
            disabled={!selectedAgentId}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Printable Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : !report ? (
        <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center text-slate-500 font-mono">
          No report telemetry available. Run a security assessment first.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-mono">{report.title}</h3>
                <p className="text-xs text-slate-400 font-mono">Generated At: {report.generated_at}</p>
              </div>
              <SeverityBadge level={report.risk_summary.overall_risk_level} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Overall Risk Score</span>
                <span className="text-2xl font-bold text-cyan-400">{report.risk_summary.overall_risk_score}%</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Tests Passed</span>
                <span className="text-2xl font-bold text-emerald-400">{report.risk_summary.passed_tests} / {report.risk_summary.total_tests}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase block mb-1">Data Access Level</span>
                <span className="text-lg font-bold text-white">{report.agent_info.data_access_level}</span>
              </div>
            </div>
          </div>

          {/* Detailed Findings Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Detailed Security Findings ({report.results.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Test ID</th>
                    <th className="p-3">Test Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {report.results.map((r: any) => (
                    <tr key={r.test_id}>
                      <td className="p-3 text-cyan-400 font-bold">{r.test_id}</td>
                      <td className="p-3 text-white font-semibold">{r.name}</td>
                      <td className="p-3 text-slate-400">{r.category}</td>
                      <td className="p-3"><SeverityBadge level={r.status} /></td>
                      <td className="p-3"><SeverityBadge level={r.severity} size="sm" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Automated Remediation Roadmap</h3>
            <div className="space-y-3 font-mono text-xs">
              {report.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border-l-4 border-l-cyan-500 border-y border-r border-slate-800 space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">{rec.priority} PRIORITY</span>
                    {rec.finding}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong>Remediation:</strong> {rec.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
