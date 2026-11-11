import axios from 'axios';
import {
  Agent,
  AgentCreateInput,
  SecurityTest,
  TestResult,
  SecurityEvent,
  ToolCallLog,
  DashboardSummary
} from '../types';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  getHealth: () => API.get('/health'),

  // Dashboard
  getDashboardSummary: (agentId?: number) =>
    API.get<DashboardSummary>('/dashboard/summary', { params: { agent_id: agentId } }),

  // Agents
  getAgents: () => API.get<Agent[]>('/agents'),
  getAgent: (id: number) => API.get<Agent>(`/agents/${id}`),
  createAgent: (data: AgentCreateInput) => API.post<Agent>('/agents', data),
  updateAgent: (id: number, data: Partial<AgentCreateInput>) => API.put<Agent>(`/agents/${id}`, data),
  deleteAgent: (id: number) => API.delete(`/agents/${id}`),
  runAgentAssessment: (id: number) => API.post(`/agents/${id}/test`),

  // Security Tests
  getSecurityTests: (category?: string) =>
    API.get<SecurityTest[]>('/security-tests', { params: { category } }),
  runSecurityTests: (data: { agent_id: number; categories?: string[]; test_ids?: string[] }) =>
    API.post('/security-tests/run', data),

  // Test Results
  getResults: (params?: { agent_id?: number; status_filter?: string }) =>
    API.get<TestResult[]>('/results', { params }),
  getResult: (id: number) => API.get<TestResult>(`/results/${id}`),

  // Security Events
  getSecurityEvents: (params?: { agent_id?: number; severity?: string; event_type?: string }) =>
    API.get<SecurityEvent[]>('/security-events', { params }),
  getSecurityEvent: (id: number) => API.get<SecurityEvent>(`/security-events/${id}`),

  // Tool Calls
  getToolCalls: (params?: { agent_id?: number; allowed?: boolean }) =>
    API.get<ToolCallLog[]>('/tool-calls', { params }),

  // Reports
  getReportJson: (agentId: number) => API.get(`/reports/${agentId}`),
  getReportHtmlUrl: (agentId: number) => `/api/reports/${agentId}/generate`
};
