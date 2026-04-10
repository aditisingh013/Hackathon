import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Clock, Target, Flame, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge, Skeleton } from '../ui';
import RecommendationCard from '../cards/RecommendationCard';
import { getEmployeeById, getAIInsights, getSentimentTrends } from '../../services/api';

function BurnoutGauge({ risk, sentiment }) {
  const cfg = {
    High:   { color: 'text-apple-red',    bg: 'bg-apple-red',    width: '85%' },
    Medium: { color: 'text-apple-orange',  bg: 'bg-apple-orange',  width: '50%' },
    Low:    { color: 'text-apple-green',   bg: 'bg-apple-green',   width: '20%' },
  }[risk] || { color: 'text-apple-green', bg: 'bg-apple-green', width: '20%' };

  return (
    <div className="bg-surfaceAlt dark:bg-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-textSecondary flex items-center gap-1.5">
          <Flame size={14} /> AI Burnout Diagnosis
        </span>
        <Badge text={risk || 'Low'} />
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${cfg.bg} transition-all duration-700 ease-apple`}
          style={{ width: cfg.width }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-textSecondary mt-1.5">
        <span>Low</span><span>Medium</span><span>Critical</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
        <span className="text-xs text-textSecondary">Active Sentiment Score</span>
        <span className={`text-xl font-bold ${cfg.color}`}>{sentiment || 0}</span>
      </div>
    </div>
  );
}

export default function EmployeeModal({ employeeId, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ emp: null, ai: null, trends: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!employeeId) return;
      try {
        setLoading(true);
        // Load simultaneously dynamically to speed UX
        const [empRes, aiRes, trendsRes] = await Promise.all([
          getEmployeeById(employeeId),
          getAIInsights(employeeId),
          getSentimentTrends(employeeId)
        ]);

        setData({
          emp: empRes.data,
          ai: aiRes.data,
          trends: trendsRes.data
        });
      } catch (err) {
        console.error("Error loading employee data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  if (!employeeId) return null;

  const { emp, ai, trends } = data;

  // Derive charts safely mapping logs
  const activityTimeline = (emp?.activityLogs || []).slice(-7).map(log => ({
     day: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short' }),
     hours: log.hoursWorked,
     tasks: log.tasksCompleted
  }));

  // Map AI recommendations format
  const aiFormattedRecs = ai?.recommendations?.map((r, i) => ({
    id: i,
    priority: ai.riskLevel,
    title: r,
    description: ai.keyInsights?.[i] || "Identified flagged anomaly via semantic drift limits.",
  })) || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

        <motion.div
          className="relative w-full max-w-xl bg-white dark:bg-surfaceDark h-full shadow-modal flex flex-col overflow-hidden"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {loading ? (
             <div className="p-10 space-y-6">
                <Skeleton className="w-48 h-8" />
                <Skeleton className="w-full h-32 rounded-2xl" />
                <Skeleton className="w-full h-64 rounded-2xl" />
             </div>
          ) : !emp ? (
             <div className="p-10 text-center text-textSecondary">Error loading profiles</div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
                <h2 className="text-lg font-semibold text-textPrimary dark:text-white">Employee Detail</h2>
                <button onClick={onClose} className="p-2 rounded-full text-textSecondary hover:bg-surfaceAlt dark:hover:bg-white/5 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 bg-surfaceAlt dark:bg-surfaceDarkAlt border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-start gap-4">
                    <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}&background=random`} alt={emp.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-textPrimary dark:text-white tracking-tight">{emp.name}</h3>
                      <p className="text-sm text-textSecondary mt-0.5">{emp.role} · {emp.department}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge text={emp.status} type={emp.status === 'Active' ? 'Low' : 'Medium'} />
                        <Badge text={`${emp.burnoutRisk} Risk`} type={emp.burnoutRisk} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      { label: 'Productivity', value: `${emp.productivityScore}%`, icon: <Target size={14} /> },
                      { label: 'Workload',   value: `${emp.workload}%`, icon: <Clock size={14} /> },
                      { label: 'Joined',   value: emp.joinDate || "N/A", icon: <TrendingUp size={14} /> },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-textSecondary flex justify-center mb-1">{s.icon}</div>
                        <p className="text-lg font-bold text-textPrimary dark:text-white">{s.value}</p>
                        <p className="text-[10px] text-textSecondary uppercase tracking-[0.08em]">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-white/5 px-6 shrink-0">
                  {['overview', 'activity', 'drift', 'insights'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-[13px] font-medium capitalize transition-colors duration-200 border-b-2 ${
                        activeTab === tab ? 'border-apple-blue text-apple-blue' : 'border-transparent text-textSecondary hover:text-textPrimary dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 flex flex-col gap-5">
                  {activeTab === 'overview' && (
                    <>
                      <BurnoutGauge risk={ai?.riskLevel || emp.burnoutRisk} sentiment={emp.sentimentScore} />
                      <div className="bg-surfaceAlt dark:bg-white/5 rounded-2xl p-5 space-y-3">
                        <h4 className="text-[10px] uppercase tracking-[0.12em] font-medium text-textSecondary">Profile Info</h4>
                        {[
                          { icon: <Mail size={14} />,     label: emp.email },
                          { icon: <Clock size={14} />,    label: `Joined ${emp.joinDate || 'recently'}` },
                          { icon: <Activity size={14} />, label: `Reports to ${emp.manager || 'Admin'}` }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm text-textPrimary dark:text-gray-300">
                            <span className="text-textSecondary">{item.icon}</span>{item.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'activity' && (
                    <>
                      <div>
                        <h4 className="text-sm font-semibold text-textPrimary dark:text-white mb-4">Workload vs Tasks</h4>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#007aff" stopOpacity={0.12} />
                                  <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#86868b', fontSize: 11 }} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                              <Area type="monotone" dataKey="hours" name="Hours" stroke="#007aff" strokeWidth={2} fill="url(#hoursGrad)" dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="relative pl-5 border-l-2 border-gray-100 dark:border-white/10 space-y-4 mt-6">
                        {activityTimeline.slice().reverse().map((day, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[21px] w-3.5 h-3.5 bg-apple-blue rounded-full border-2 border-white dark:border-surfaceDark" />
                            <div className="bg-surfaceAlt dark:bg-white/5 rounded-xl p-3 ml-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-textPrimary dark:text-white text-sm">{day.day}</span>
                                <span className={`text-xs font-semibold ${day.hours > 10 ? 'text-apple-red' : 'text-apple-green'}`}>
                                  {day.hours}h logged
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'drift' && (
                     <div className="space-y-4">
                        <div className="p-4 bg-apple-blue/5 rounded-xl border border-apple-blue/10">
                           <h4 className="text-sm font-semibold text-apple-blue mb-1">Semantic Drift Analysis</h4>
                           <p className="text-xs text-textSecondary">
                              {trends?.overallDriftAnalysis || "Compiling conversational emotional bias via LLM sentiment..."}
                           </p>
                        </div>
                        {(!trends || trends.data?.length === 0) ? (
                          <p className="text-sm text-textSecondary text-center py-6">Not enough conversational data evaluated yet.</p>
                        ) : (
                           <div className="relative pl-5 border-l-2 border-gray-100 dark:border-white/10 space-y-4">
                             {trends.data.slice().reverse().map((t, i) => (
                               <div key={i} className="relative">
                                  <div className={`absolute -left-[21px] w-3.5 h-3.5 rounded-full border-2 border-white dark:border-surfaceDark ${t.avgSentimentScore < 0 ? 'bg-apple-red' : 'bg-apple-green'}`} />
                                  <div className="bg-surfaceAlt dark:bg-white/5 rounded-xl p-3 ml-2">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-textPrimary dark:text-white text-sm">{new Date(t.date).toLocaleDateString()}</span>
                                      <span className="text-xs text-textSecondary">Score: {t.avgSentimentScore.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-textSecondary mt-1">{t.trendDescription}</p>
                                  </div>
                               </div>
                             ))}
                           </div>
                        )}
                     </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="space-y-4">
                      {aiFormattedRecs.length > 0 ? aiFormattedRecs.map((rec, i) => (
                        <RecommendationCard key={i} rec={rec} />
                      )) : (
                        <p className="text-sm text-textSecondary">Analyzing recent logs to construct personalized recommendations...</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
