import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeProfile';
import Alerts from './pages/Reports';
import Insights from './pages/Insights';
import AIAssistant from './pages/AIAssistant';
import MeetingRoom from './pages/MeetingRoom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="insights" element={<Insights />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="meeting" element={<MeetingRoom />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
