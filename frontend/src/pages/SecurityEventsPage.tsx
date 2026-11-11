import React, { useEffect, useState } from 'react';
import { AlertTriangle, Filter, Search, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { SecurityEvent } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { EventDetailModal } from '../components/EventDetailModal';

export const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedSeverity]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedSeverity) params.severity = selectedSeverity;
      const res = await api.getSecurityEvents(params);
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
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
            SECURITY EVENTS & INCIDENTS LOG
          </h2>
          <p className="text-xs text-slate-400">Detailed security policy violations, blocked access attempts, and prompt injection events.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Filter by Severity:</span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-xs">
          {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedSeverity === sev
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev || 'All Severities'}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Incident ID / Type</th>
                <th className="p-3.5">Agent</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Decision</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading security events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No security events logged. Run security tests to generate threat telemetry.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <SeverityBadge level={ev.severity} />
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white block">#{ev.id} - {ev.event_type}</span>
                      <span className="text-[10px] text-cyan-400">Test {ev.test_id || 'N/A'}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{ev.agent_name || `ID ${ev.agent_id}`}</td>
                    <td className="p-3.5 text-slate-300 max-w-sm truncate">{ev.description}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ev.policy_decision === 'BLOCK'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {ev.policy_decision || 'FAIL'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono"
                      >
                        Inspect Incident
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
