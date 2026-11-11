import React from 'react';
import { X, ShieldAlert, Terminal, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';
import { SecurityEvent } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface EventDetailModalProps {
  event: SecurityEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden glass-card flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                SECURITY INCIDENT DETAIL #{event.id}
                <SeverityBadge level={event.severity} />
              </h3>
              <p className="text-xs text-slate-400">{event.event_type} • Agent ID: {event.agent_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Incident Overview */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">Incident Description</span>
            <p className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 font-mono text-xs">
              {event.description}
            </p>
          </div>

          {/* Attack Input */}
          {event.attack_input && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Adversarial Attack Input
              </span>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs whitespace-pre-wrap">
                {event.attack_input}
              </pre>
            </div>
          )}

          {/* Tool Called & Policy Decision */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono">Tool Requested:</span>
              <p className="font-mono font-bold text-slate-200 text-xs">{event.tool_requested || 'None (Direct Text)'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-mono">Policy Decision:</span>
              <p className="font-mono font-bold text-red-400 text-xs">{event.policy_decision || 'FAIL / ALERT'}</p>
            </div>
          </div>

          {/* Evidence Snippet */}
          {event.evidence && (
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                Security Assessment Evidence
              </span>
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-amber-900/40 text-amber-200 font-mono text-xs whitespace-pre-wrap">
                {event.evidence}
              </pre>
            </div>
          )}

          {/* Remediation Suggestion */}
          {event.remediation && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                <CheckCircle className="w-4 h-4" />
                Recommended SOC Remediation Strategy
              </span>
              <p className="text-xs text-emerald-200 leading-relaxed font-mono">
                {event.remediation}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close Incident Panel
          </button>
        </div>
      </div>
    </div>
  );
};
