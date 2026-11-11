import React, { useEffect, useState } from 'react';
import {
  Bot,
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { api } from '../api/client';
import { DashboardSummary, SecurityEvent } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskGauge } from '../components/RiskGauge';
import { SeverityBadge } from '../components/SeverityBadge';
import { EventDetailModal } from '../components/EventDetailModal';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Loading SOC Dashboard Telemetry...</p>
        </div>
      </div>
    );
  }

  // Chart data formatting
  const pieData = [
    { name: 'Passed', value: summary.tests_passed, color: '#10b981' },
    { name: 'Failed', value: summary.tests_failed, color: '#ef4444' },
  ];

  const categoryChartData = summary.category_breakdown.map((cat) => ({
    name: cat.category,
    risk: cat.risk_score,
    failed: cat.failed_tests,
    passed: cat.passed_tests,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            SECURITY ASSESSMENT DASHBOARD
          </h2>
          <p className="text-xs text-slate-400">Real-time threat governance & risk telemetry for configured AI Agents.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSummary}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            Refresh Telemetry
          </button>
          <Link
            to="/testing"
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Run Security Assessment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total AI Agents" value={summary.total_agents} subtitle="Configured Sandbox Agents" icon={Bot} color="cyan" />
        <StatCard title="Tests Executed" value={summary.total_tests} subtitle={`${summary.tests_passed} Passed / ${summary.tests_failed} Issues`} icon={Activity} color="purple" />
        <StatCard title="Critical Incidents" value={summary.critical_issues} subtitle="Immediate Policy Intervention Required" icon={AlertTriangle} color="red" />
        <StatCard title="Overall Risk Score" value={`${summary.overall_risk_score}%`} subtitle={`Postural Clearance: ${summary.overall_risk_level}`} icon={ShieldCheck} color={summary.overall_risk_level === 'CRITICAL' ? 'red' : 'emerald'} />
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Gauge Widget */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Overall Risk Index</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Weighted Formula</span>
          </div>
          <RiskGauge score={summary.overall_risk_score} level={summary.overall_risk_level} />
        </div>

        {/* Risk Breakdown by Category */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Category Risk Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Risk % per Security Category</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 60 ? '#ef4444' : entry.risk > 30 ? '#f59e0b' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Recent Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Recent Security Events
            </h3>
            <Link to="/events" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Event Type</th>
                  <th className="p-2.5">Agent</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {summary.recent_events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">No security events logged yet.</td>
                  </tr>
                ) : (
                  summary.recent_events.slice(0, 5).map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5"><SeverityBadge level={ev.severity} /></td>
                      <td className="p-2.5 text-white font-semibold">{ev.event_type}</td>
                      <td className="p-2.5 text-slate-400">{ev.agent_name || `ID ${ev.agent_id}`}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => setSelectedEvent(ev)}
                          className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Tool Calls */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Recent Tool Calls Audit
            </h3>
            <Link to="/tool-calls" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
              View Audit Log <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 font-mono">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Tool</th>
                  <th className="p-2.5">Decision</th>
                  <th className="p-2.5">Result Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {summary.recent_tool_calls.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">No tool calls audited yet.</td>
                  </tr>
                ) : (
                  summary.recent_tool_calls.slice(0, 5).map((tc) => (
                    <tr key={tc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-2.5 text-cyan-300 font-semibold">{tc.tool_name}</td>
                      <td className="p-2.5">
                        {tc.allowed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">ALLOWED</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold border border-red-500/30">BLOCKED</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400 truncate max-w-[200px]">{tc.result_summary || 'No summary'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Incident Detail Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
