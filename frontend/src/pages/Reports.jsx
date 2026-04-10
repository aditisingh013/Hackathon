import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Skeleton } from '../components/ui';
import FadeIn from '../components/ui/FadeIn';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnalyticsAnomalies } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    async function loadAnomalies() {
      try {
        setLoading(true);
        const res = await getAnalyticsAnomalies();
        if (res.data) setAlerts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnomalies();
  }, []);

  const visible = alerts.filter(a => !dismissed.includes(a._id || a.employeeId + a.type));

  return (
    <div className="flex flex-col gap-8 pb-12">
      <FadeIn>
        <PageHeader
          title="Alerts"
          subtitle={loading ? "Analyzing risk flags..." : "AI-detected anomalies and burnout risk flags."}
        >
          {!loading && (
            <span className="text-sm font-medium text-textSecondary">
              {visible.length} active
            </span>
          )}
        </PageHeader>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : visible.length === 0 ? (
        <FadeIn>
          <Card className="p-20 flex flex-col items-center text-center gap-3">
            <CheckCircle2 size={44} className="text-apple-green opacity-70" />
            <h3 className="text-lg font-semibold text-textPrimary dark:text-white">All clear</h3>
            <p className="text-textSecondary text-sm">No active alerts. Your workforce looks healthy.</p>
          </Card>
        </FadeIn>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {visible.map((alert, i) => {
              const uniqueId = alert._id || alert.employeeId + alert.type;
              return (
              <motion.div
                key={uniqueId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Card className="p-6 flex items-start gap-5">
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    alert.severity === 'High' ? 'bg-apple-red' :
                    alert.severity === 'Medium' ? 'bg-apple-orange' : 'bg-apple-blue'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <h3 className="text-base font-semibold text-textPrimary dark:text-white">
                            {alert.name} ({alert.department})
                          </h3>
                          <Badge text={alert.severity} type={alert.severity} />
                        </div>
                        <p className="text-sm text-textSecondary leading-relaxed">{alert.description}</p>
                      </div>
                      <span className="text-[11px] text-textSecondary whitespace-nowrap shrink-0 pt-0.5">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button className="text-sm font-medium text-apple-blue hover:opacity-70 transition-opacity">
                        Acknowledge
                      </button>
                      <button
                        onClick={() => setDismissed(d => [...d, uniqueId])}
                        className="text-sm font-medium text-textSecondary hover:text-textPrimary dark:hover:text-white ml-auto transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
