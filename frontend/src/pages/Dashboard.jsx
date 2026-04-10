import React from 'react';
import KpiCard from '../components/cards/KpiCard';
import { kpiData, productivityTrends, departmentProductivity, burnoutDistribution, recentAlerts } from '../utils/mockData';
import { Users, Activity, Flame, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Health</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time pulse of your workforce</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
          Download Report
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Employees" value={kpiData.totalEmployees} icon={<Users size={24} />} />
        <KpiCard title="Avg. Productivity" value={`${kpiData.productivityScore}%`} change={kpiData.scoreChange} isPositiveChange={true} icon={<Activity size={24} />} />
        <KpiCard title="Burnout Risk" value={`${kpiData.burnoutRisk}%`} change={kpiData.burnoutChange} isPositiveChange={false} icon={<Flame size={24} />} />
        <KpiCard title="Active Tasks" value={kpiData.activeTasks} icon={<CheckCircle2 size={24} />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Productivity Trends (6 Weeks)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityTrends} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1}}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Burnout Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={burnoutDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {burnoutDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart */}
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Department Workload vs Performance</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentProductivity} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10}/>
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Legend verticalAlign="top" height={36} iconType="circle"/>
                <Bar dataKey="score" name="Performance Score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="workload" name="Workload Stress" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass-panel p-5 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Critical Alerts</h3>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="p-3 border border-slate-100 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-start gap-3">
                <div className="mt-0.5">
                  {alert.severity === 'High' ? <ShieldAlert className="text-red-500" size={20}/> : 
                   alert.severity === 'Medium' ? <AlertTriangle className="text-amber-500" size={20}/> :
                   <Activity className="text-blue-500" size={20}/>}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{alert.desc}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-2 block">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
