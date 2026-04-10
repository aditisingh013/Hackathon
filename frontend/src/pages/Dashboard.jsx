import React, { useState, useEffect } from 'react';
import KpiCard from '../components/cards/KpiCard';
import ChartWrapper from '../components/charts/ChartWrapper';
import AlertItem from '../components/alerts/AlertItem';
import FadeIn from '../components/ui/FadeIn';
import { Skeleton, Card } from '../components/ui';
import { Users, Activity, Flame, CheckSquare } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Line
} from 'recharts';
import { NavLink } from 'react-router-dom';

import { getAnalyticsProductivity, getAnalyticsBurnout, getAnalyticsAnomalies } from '../services/api';

const tooltipStyle = {
  contentStyle: {
    borderRadius: '14px',
    border: 'none',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    fontSize: '12px',
    backgroundColor: '#fff',
    padding: '10px 14px',
  },
};

function GradientDefs() {
  return (
    <defs>
      <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#007aff" stopOpacity={0.10} />
        <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-surfaceDarkAlt rounded-2xl p-6 space-y-3 shadow-soft">
      <Skeleton className="w-10 h-10" />
      <Skeleton className="w-20 h-8" />
      <Skeleton className="w-32 h-4" />
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [prodData, burnoutData, alertsData] = await Promise.all([
          getAnalyticsProductivity(),
          getAnalyticsBurnout(),
          getAnalyticsAnomalies()
        ]);

        const prod = prodData.data;
        const burn = burnoutData.data;
        const anomalies = alertsData.data || [];

        // Build KPI structural map matching prior mock interface
        const kpi = {
          totalEmployees: prod.totalEmployees || 0,
          productivityScore: prod.avgProductivity || 0,
          burnoutRisk: burn.distribution?.high?.percentage || 0,
          activeTasks: Math.round(prod.totalEmployees * 4.2), // Derived metric if missing
        };

        // Format burnout distribution for Recharts
        const pieData = [
          { name: 'Low Risk', value: burn.distribution?.low?.percentage || 0, color: '#34c759' },
          { name: 'Medium Risk', value: burn.distribution?.medium?.percentage || 0, color: '#ff9500' },
          { name: 'High Risk', value: burn.distribution?.high?.percentage || 0, color: '#ff3b30' }
        ];

        // Format Area Chart Trends adding a baseline
        const trends = (prod.trends || []).map(t => ({
           name: t.week,
           score: t.score,
           baseline: 70
        }));

        setMetrics({ kpi, pieData, trends, departments: prod.departments || [], anomalies });
      } catch (err) {
        setError("Failed to load dashboard data. Please check your connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (error) {
    return <div className="text-center py-20 text-textSecondary">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-12 pb-12">
      <FadeIn>
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-textPrimary dark:text-white leading-tight">
            Employee Intelligence,
            <br />
            <span className="text-textSecondary">Simplified.</span>
          </h1>
          <p className="text-lg sm:text-xl text-textSecondary mt-4 max-w-xl mx-auto leading-relaxed">
            Understand productivity. Prevent burnout.
          </p>
        </div>
      </FadeIn>

      {/* KPI ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? Array(4).fill(0).map((_, i) => <KpiSkeleton key={i} />) : (
          <>
            <FadeIn delay={0}>
              <KpiCard title="Total Employees" value={metrics.kpi.totalEmployees} change={{val: 5, time: 'mo'}} positive icon={<Users size={20} />} />
            </FadeIn>
            <FadeIn delay={0.1}>
              <KpiCard title="Avg. Productivity" value={`${metrics.kpi.productivityScore}%`} change={{val: 2, time: 'wk'}} positive icon={<Activity size={20} />} />
            </FadeIn>
            <FadeIn delay={0.2}>
              <KpiCard title="Burnout Risk" value={`${metrics.kpi.burnoutRisk}%`} change={{val: 1.2, time: 'wk'}} positive={false} icon={<Flame size={20} />} />
            </FadeIn>
            <FadeIn delay={0.3}>
              <KpiCard title="Active Assignments" value={metrics.kpi.activeTasks.toLocaleString()} change={{val: 12, time: 'mo'}} positive icon={<CheckSquare size={20} />} />
            </FadeIn>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2" delay={0.4}>
          <ChartWrapper title="Productivity Trends" subtitle="Rolling score vs 70% baseline target">
            {loading ? <Skeleton className="h-72 w-full" /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.trends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <GradientDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} domain={[55, 100]} />
                    <Tooltip {...tooltipStyle} cursor={{ stroke: '#e5e5e5', strokeWidth: 1 }} />
                    <Area type="monotone" dataKey="score" name="Score" stroke="#007aff" strokeWidth={2.5} fill="url(#prodGrad)" dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="baseline" name="Target" stroke="#d1d1d6" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartWrapper>
        </FadeIn>

        <FadeIn delay={0.5}>
          <ChartWrapper title="Burnout Distribution" subtitle="Workforce by risk level">
            {loading ? <Skeleton className="h-72 w-full" /> : (
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.pieData} cx="50%" cy="45%" innerRadius={58} outerRadius={85}
                      paddingAngle={3} dataKey="value" strokeWidth={0}
                    >
                      {metrics.pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(val) => `${val}%`} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-textSecondary">{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartWrapper>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.6}>
          <ChartWrapper title="Department Performance" subtitle="Score vs workload footprint">
            {loading ? <Skeleton className="h-60 w-full" /> : (
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.departments} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} />
                    <Tooltip {...tooltipStyle} cursor={{ fill: '#fafafa' }} />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-textSecondary">{v}</span>} />
                    <Bar dataKey="avgProductivity" name="Performance" fill="#34c759" radius={[6, 6, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="avgWorkload" name="Workload" fill="#007aff" radius={[6, 6, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartWrapper>
        </FadeIn>

        <FadeIn delay={0.7}>
          <Card className="p-6 sm:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-textPrimary dark:text-white tracking-tight">Recent Anomalies</h3>
              <NavLink to="/alerts" className="text-sm font-medium text-apple-blue hover:opacity-70 transition-opacity">
                View all
              </NavLink>
            </div>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {metrics.anomalies.length > 0 ? metrics.anomalies.slice(0, 4).map((alert, idx) => (
                  <AlertItem key={idx} alert={{
                    id: idx,
                    title: `${alert.name} in ${alert.department}`,
                    severity: alert.severity,
                    desc: alert.description,
                    time: "Recent"
                  }} />
                )) : <p className="text-sm text-textSecondary">No anomalies detected.</p>}
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
