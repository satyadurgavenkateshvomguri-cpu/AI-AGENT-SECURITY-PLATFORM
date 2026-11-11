import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { CreateAgentPage } from './pages/CreateAgentPage';
import { SecurityTestingPage } from './pages/SecurityTestingPage';
import { TestResultsPage } from './pages/TestResultsPage';
import { SecurityEventsPage } from './pages/SecurityEventsPage';
import { ToolCallsPage } from './pages/ToolCallsPage';
import { PermissionsPage } from './pages/PermissionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#090d16] flex flex-col font-[Inter] text-slate-100">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agents/create" element={<CreateAgentPage />} />
              <Route path="/testing" element={<SecurityTestingPage />} />
              <Route path="/results" element={<TestResultsPage />} />
              <Route path="/events" element={<SecurityEventsPage />} />
              <Route path="/tool-calls" element={<ToolCallsPage />} />
              <Route path="/permissions" element={<PermissionsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
