export interface Permission {
  tool_name: string;
  is_allowed: boolean;
}

export interface Agent {
  id: number;
  name: string;
  description?: string;
  system_prompt: string;
  llm_provider: string;
  model: string;
  temperature: number;
  max_tool_calls: number;
  data_access_level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface AgentCreateInput {
  name: string;
  description?: string;
  system_prompt: string;
  llm_provider: string;
  model: string;
  temperature: number;
  max_tool_calls: number;
  data_access_level: string;
  permissions: Permission[];
}

export interface SecurityTest {
  id: number;
  test_id: string;
  category: string;
  name: string;
  description: string;
  attack_input: string;
  expected_secure_behavior: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_enabled: boolean;
}

export interface TestResult {
  id: number;
  agent_id: number;
  test_id: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED' | 'WARNING';
  actual_behavior: string;
  detected: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  evidence?: string;
  timestamp: string;
  test_name?: string;
  category?: string;
}

export interface SecurityEvent {
  id: number;
  agent_id: number;
  agent_name?: string;
  test_id?: string;
  event_type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  attack_input?: string;
  tool_requested?: string;
  policy_decision?: string;
  evidence?: string;
  remediation?: string;
  timestamp: string;
}

export interface ToolCallLog {
  id: number;
  agent_id: number;
  agent_name?: string;
  test_id?: string;
  tool_name: string;
  tool_args?: string;
  allowed: boolean;
  result_summary?: string;
  security_flag?: string;
  timestamp: string;
}

export interface CategoryRisk {
  category: string;
  total_tests: number;
  failed_tests: number;
  passed_tests: number;
  risk_score: number;
  risk_level: 'SECURE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DashboardSummary {
  total_agents: number;
  total_tests: number;
  tests_passed: number;
  tests_failed: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  overall_risk_score: number;
  overall_risk_percentage: number;
  overall_risk_level: 'SECURE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category_breakdown: CategoryRisk[];
  recent_events: SecurityEvent[];
  recent_tool_calls: ToolCallLog[];
}
