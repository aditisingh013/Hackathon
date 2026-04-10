import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { PageHeader, Badge, Card, Skeleton } from '../components/ui';
import FadeIn from '../components/ui/FadeIn';
import EmployeeModal from '../components/layout/EmployeeModal';
import { getEmployees } from '../services/api';

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
const RISKS = ['All', 'High', 'Medium', 'Low'];

function ProductivityBar({ score }) {
  const color = score >= 85 ? 'bg-apple-green' : score >= 70 ? 'bg-apple-orange' : 'bg-apple-red';
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-medium text-textPrimary dark:text-white w-8 tabular-nums">{score}</span>
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500 ease-apple`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    async function fetchStaff() {
      try {
        setLoading(true);
        const res = await getEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        setError('Failed to fetch employee list.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
        (e.role && e.role.toLowerCase().includes(search.toLowerCase()));
      const matchDept = deptFilter === 'All' || e.department === deptFilter;
      const matchRisk = riskFilter === 'All' || e.burnoutRisk === riskFilter;
      return matchSearch && matchDept && matchRisk;
    });
  }, [search, deptFilter, riskFilter, employees]);

  if (error) {
    return <div className="text-center py-20 text-textSecondary">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <FadeIn>
        <PageHeader
          title="Employee Insights"
          subtitle={loading ? "Loading directory..." : `Showing ${filtered.length} of ${employees.length} employees`}
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textSecondary" />
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-surfaceDarkAlt rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-apple-blue/30 dark:text-white transition-shadow placeholder:text-textSecondary"
            />
          </div>
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-sm bg-white dark:bg-surfaceDarkAlt rounded-xl shadow-soft px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-apple-blue/30 dark:text-white text-textPrimary"
          >
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="text-sm bg-white dark:bg-surfaceDarkAlt rounded-xl shadow-soft px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-apple-blue/30 dark:text-white text-textPrimary"
          >
            {RISKS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  {['Employee', 'Department', 'Productivity', 'Burnout Risk', 'Status', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-[11px] uppercase tracking-[0.1em] font-medium text-textSecondary whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-white/[0.03]">
                      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-textSecondary text-sm">
                      No employees match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map(emp => (
                    <motion.tr
                      key={emp._id}
                      whileHover={{ backgroundColor: 'rgba(0,122,255,0.03)' }}
                      className="border-b border-gray-50 dark:border-white/[0.03] cursor-pointer transition-colors"
                      onClick={() => setSelectedEmp(emp)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}&background=random`} alt={emp.name} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-medium text-textPrimary dark:text-white">{emp.name}</p>
                            <p className="text-xs text-textSecondary">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary whitespace-nowrap">{emp.department}</td>
                      <td className="px-6 py-4 w-40">
                        <ProductivityBar score={emp.productivityScore} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge text={emp.burnoutRisk} />
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium ${emp.status === 'Active' ? 'text-apple-green' : 'text-textSecondary'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 inline" />
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-6 py-3.5 text-xs text-textSecondary border-t border-gray-50 dark:border-white/[0.03]">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Click a row to view full profile
            </div>
          )}
        </Card>
      </FadeIn>

      {selectedEmp && (
        <EmployeeModal employeeId={selectedEmp._id} onClose={() => setSelectedEmp(null)} />
      )}
    </div>
  );
}
