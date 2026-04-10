import React, { useState } from 'react';
import { employees } from '../utils/mockData';
import { Search, Filter, ChevronRight, X, Briefcase, Activity, Target } from 'lucide-react';
import { recommendationCards } from '../utils/mockData';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeProfile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Insights</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deep dive into individual workforce metrics and AI recommendations</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative relative-group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white"
            />
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Productivity</th>
                <th className="p-4">Burnout Risk</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(emp)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{emp.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{emp.department}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold dark:text-slate-200">{emp.productivity}</span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${emp.productivity}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      emp.burnoutRisk === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      emp.burnoutRisk === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    }`}>
                      {emp.burnoutRisk}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{emp.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 group-hover:text-primary-600 transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedUser(emp)}}>
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Modal for Details */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 flex justify-end"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-6 relative z-50 flex flex-col pt-16 md:pt-6"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
                onClick={() => setSelectedUser(null)}
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center border-b border-slate-100 dark:border-slate-800 pb-6 mb-6 mt-4">
                <img src={selectedUser.avatar} className="w-24 h-24 rounded-full border-4 border-primary-50 dark:border-slate-800 shadow-sm mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{selectedUser.role} • {selectedUser.department}</p>
                <div className="flex items-center gap-3 mt-4">
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${
                    selectedUser.burnoutRisk === 'High' ? 'border-red-200 text-red-600 bg-red-50 dark:bg-red-900/10' :
                    selectedUser.burnoutRisk === 'Medium' ? 'border-amber-200 text-amber-600 bg-amber-50 dark:bg-amber-900/10' :
                    'border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10'
                  }`}>
                    {selectedUser.burnoutRisk} Burnout Risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1"><Target size={14}/> Productivity</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{selectedUser.productivity}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider flex items-center gap-1"><Briefcase size={14}/> Hours Logged</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">52h</div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="text-primary-500" size={20} />
                AI Recommendations
              </h3>
              
              <div className="space-y-3 flex-1">
                {recommendationCards.map((rec) => (
                  <div key={rec.id} className="p-4 border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"></div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{rec.text}</p>
                    <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 rounded p-1 px-3">
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
