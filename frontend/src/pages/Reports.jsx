import React from 'react';
import { recentAlerts } from '../utils/mockData';
import { ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

export default function Reports() {
  // Stub for Alerts & Notifications Page
  return (
    <div className="flex flex-col gap-6 max-w-4xl max-w- mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts & Notifications</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review system flags regarding workforce burnout and anomalies.</p>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-4">
        {recentAlerts.map((alert) => (
           <div key={alert.id} className="p-5 border border-slate-100 dark:border-slate-700/50 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-start gap-4">
           <div className={`p-3 rounded-full mt-1 ${alert.severity === 'High' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : alert.severity === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
             {alert.severity === 'High' ? <ShieldAlert size={24}/> : 
              alert.severity === 'Medium' ? <AlertTriangle size={24}/> :
              <Activity size={24}/>}
           </div>
           <div className="flex-1">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{alert.title}</h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${alert.severity === 'High' ? 'text-red-600 border-red-200' : alert.severity === 'Medium' ? 'text-amber-600 border-amber-200' : 'text-blue-600 border-blue-200'}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400">{alert.time}</span>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{alert.desc}</p>
             <div className="mt-4 flex gap-3 ">
               <button className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">Acknowledge</button>
               {alert.severity === 'High' && <button className="text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition">View Affected Profiles</button>}
             </div>
           </div>
         </div>
        ))}
        {/* Placeholder for more */}
        <div className="p-5 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex items-center justify-center text-slate-500 text-sm font-medium h-24 mt-2">
            You're all caught up! No more alerts.
        </div>
      </div>
    </div>
  );
}
