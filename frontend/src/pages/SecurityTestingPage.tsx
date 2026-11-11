import React, { useEffect, useState } from 'react';
import { PlayCircle, ShieldCheck, CheckSquare, Square, Bot, Activity, AlertOctagon } from 'lucide-react';
import { api } from '../api/client';
import { Agent, SecurityTest } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';

const CATEGORIES = [
  "Prompt Injection",
  "Data Leakage",
  "Excessive Permissions",
  "Unsafe Tool Usage",
  "Unauthorized Tool Access",
  "Malicious Input",
  "Tool Output Manipulation"
];

export const SecurityTestingPage: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES);
  const [tests, setTests] = useState<SecurityTest[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [runProgress, setRunProgress] = useState<number>(0);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsRes, testsRes] = await Promise.all([
        api.getAgents(),
        api.getSecurityTests()
      ]);
      setAgents(agentsRes.data);
      if (agentsRes.data.length > 0) {
        setSelectedAgentId(agentsRes.data[0].id);
      }
      setTests(testsRes.data);
    } catch (err) {
      console.error('Failed to load testing data:', err);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleAll = () => {
    if (selectedCategories.length === CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(CATEGORIES);
    }
  };

  const handleRunAssessment = async () => {
    if (!selectedAgentId) {
      alert('Please select an agent to test.');
      return;
    }
    if (selectedCategories.length === 0) {
      alert('Please select at least one test category.');
      return;
    }

    setRunning(true);
    setRunProgress(15);
    setExecutionResult(null);

    const timer = setInterval(() => {
      setRunProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 400);

    try {
      const res = await api.runSecurityTests({
        agent_id: Number(selectedAgentId),
        categories: selectedCategories
      });
      setRunProgress(100);
      setExecutionResult(res.data);
    } catch (err) {
      alert('Error running security assessment.');
    } finally {
      clearInterval(timer);
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
          SECURITY ASSESSMENT ENGINE
        </h2>
        <p className="text-xs text-slate-400">Execute automated adversarial attack suites against configured AI Agents in sandbox environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="md:col-span-1 glass-card rounded-2xl p-5 border border-slate-800 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Target Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:border-cyan-500 outline-none"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.data_access_level})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                2. Test Categories ({selectedCategories.length}/{CATEGORIES.length})
              </label>
              <button
                onClick={toggleAll}
                className="text-[11px] font-mono text-cyan-400 hover:underline"
              >
                {selectedCategories.length === CATEGORIES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <div
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-mono">{cat}</span>
                    {isSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleRunAssessment}
            disabled={running}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{running ? 'Executing Assessment...' : 'RUN SECURITY ASSESSMENT'}</span>
          </button>
        </div>

        {/* Right Status / Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Progress Indicator */}
          {running && (
            <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-4 glow-cyan animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-spin" />
                  Executing Adversarial Security Test Suite...
                </span>
                <span className="text-white font-bold">{runProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${runProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Agent responding to attack inputs &rarr; Policy Engine checking permissions &rarr; Detector evaluating secrets and vulnerabilities...
              </p>
            </div>
          )}

          {/* Assessment Summary Output */}
          {executionResult && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    ASSESSMENT EXECUTION COMPLETE
                    <SeverityBadge level={executionResult.summary.overall_risk_level} />
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Target: {executionResult.agent_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-cyan-400">{executionResult.summary.overall_risk_score}%</span>
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Overall Risk</span>
                </div>
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Tests Run</span>
                  <div className="text-lg font-bold text-white">{executionResult.total_tests_executed}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Passed</span>
                  <div className="text-lg font-bold text-emerald-400">{executionResult.summary.passed_tests}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Failed</span>
                  <div className="text-lg font-bold text-red-400">{executionResult.summary.failed_tests}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Blocked</span>
                  <div className="text-lg font-bold text-purple-400">{executionResult.summary.blocked_tests}</div>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Category Results Breakdown</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Tests</th>
                        <th className="p-2.5">Passed / Failed</th>
                        <th className="p-2.5 text-right">Category Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {executionResult.summary.category_breakdown.map((c: any) => (
                        <tr key={c.category}>
                          <td className="p-2.5 text-white font-semibold">{c.category}</td>
                          <td className="p-2.5 text-slate-400">{c.total_tests}</td>
                          <td className="p-2.5">
                            <span className="text-emerald-400">{c.passed_tests}</span> / <span className="text-red-400">{c.failed_tests}</span>
                          </td>
                          <td className="p-2.5 text-right font-bold">
                            <SeverityBadge level={c.risk_level} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Test Suite Catalog Preview */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Available Test Case Catalog ({tests.length})</h3>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
              {tests.map((t) => (
                <div key={t.test_id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-0.5">
                    <span className="font-bold text-cyan-400 mr-2">[{t.test_id}]</span>
                    <span className="text-slate-200">{t.name}</span>
                    <span className="text-slate-500 block text-[10px]">{t.category}</span>
                  </div>
                  <SeverityBadge level={t.severity} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
