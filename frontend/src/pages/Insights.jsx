import React, { useState, useEffect } from 'react';
import { PageHeader, Skeleton } from '../components/ui';
import RecommendationCard from '../components/cards/RecommendationCard';
import FadeIn from '../components/ui/FadeIn';
import { getAnalyticsAnomalies } from '../services/api';

export default function Insights() {
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState({ high: [], rest: [] });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAnalyticsAnomalies();
        const anomalies = res.data || [];
        
        // Map anomalies into org-level recommendation format
        const formatted = anomalies.map((a, i) => ({
          id: i,
          priority: a.severity,
          title: `Address ${a.type.replace('_', ' ')} in ${a.department} (${a.name})`,
          description: a.description,
          impact: a.severity === 'High' ? 'Critical' : 'Moderate',
          effort: a.severity === 'High' ? 'Immediate' : 'Review'
        }));

        setRecs({
          high: formatted.filter(r => r.priority === 'High'),
          rest: formatted.filter(r => r.priority !== 'High')
        });
      } catch (e) {
         console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-10 pb-12">
      <FadeIn>
        <PageHeader
          title="AI Recommendations"
          subtitle="Actionable insights aggregated dynamically off organizational anomalies."
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-apple-blue bg-apple-blue/8 px-3 py-1.5 rounded-full">
            AI Generated
          </span>
        </PageHeader>
      </FadeIn>

      {loading ? (
         <div className="space-y-6">
           <Skeleton className="h-4 w-32" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32" /><Skeleton className="h-32" />
           </div>
         </div>
      ) : (
        <>
          {recs.high.length > 0 && (
            <FadeIn delay={0.1}>
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="w-2 h-2 bg-apple-red rounded-full" />
                  <h3 className="text-sm font-semibold text-apple-red uppercase tracking-[0.1em]">
                    High Priority Interventions
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recs.high.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.2}>
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-2 h-2 bg-textSecondary rounded-full" />
                <h3 className="text-sm font-semibold text-textSecondary uppercase tracking-[0.1em]">
                  Moderate Adjustments
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recs.rest.length > 0 ? recs.rest.map(rec => (
                   <RecommendationCard key={rec.id} rec={rec} />
                )) : <p className="text-sm text-textSecondary">No moderate adjustments required.</p>}
              </div>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
