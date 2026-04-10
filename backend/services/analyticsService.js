const Employee  = require('../models/Employee');
const Analytics = require('../models/Analytics');

// ────────────────────────────────────────────────────────────
//  Analytics Service
//  Computes org-wide productivity and burnout metrics.
//  Results can be cached in the Analytics collection for
//  dashboard performance.
// ────────────────────────────────────────────────────────────

/**
 * Calculate average productivity across all active employees.
 * Breaks down by department for the bar chart.
 */
async function getProductivityAnalytics() {
  const employees = await Employee.find({ status: 'Active' });

  if (employees.length === 0) {
    return { avgProductivity: 0, departments: [], totalEmployees: 0 };
  }

  // ── Org-wide average ──
  const totalProd = employees.reduce((sum, e) => sum + (e.productivityScore || 0), 0);
  const avgProductivity = Math.round(totalProd / employees.length);

  // ── Per-department breakdown ──
  const deptMap = {};
  employees.forEach(emp => {
    const dept = emp.department || 'Unknown';
    if (!deptMap[dept]) {
      deptMap[dept] = { totalScore: 0, totalWorkload: 0, count: 0 };
    }
    deptMap[dept].totalScore    += emp.productivityScore || 0;
    deptMap[dept].totalWorkload += emp.workload || 0;
    deptMap[dept].count         += 1;
  });

  const departments = Object.entries(deptMap).map(([name, data]) => ({
    name,
    avgProductivity: Math.round(data.totalScore / data.count),
    avgWorkload:     Math.round(data.totalWorkload / data.count),
    employeeCount:   data.count,
  }));

  // ── Productivity trends from activity logs (last 10 weeks) ──
  const trends = computeWeeklyTrends(employees);

  return {
    avgProductivity,
    totalEmployees: employees.length,
    departments,
    trends,
  };
}

/**
 * Calculate burnout distribution across the workforce.
 */
async function getBurnoutAnalytics() {
  const employees = await Employee.find({ status: 'Active' });
  const total = employees.length || 1;

  const distribution = { Low: 0, Medium: 0, High: 0 };
  employees.forEach(emp => {
    distribution[emp.burnoutRisk || 'Low'] += 1;
  });

  // ── High-risk employee details for alerts ──
  const highRiskEmployees = employees
    .filter(e => e.burnoutRisk === 'High')
    .map(e => ({
      id:           e._id,
      name:         e.name,
      department:   e.department,
      productivity: e.productivityScore,
      workload:     e.workload,
      sentiment:    e.sentimentScore,
    }));

  return {
    total,
    distribution: {
      low:    { count: distribution.Low,    percentage: Math.round((distribution.Low / total) * 100) },
      medium: { count: distribution.Medium, percentage: Math.round((distribution.Medium / total) * 100) },
      high:   { count: distribution.High,   percentage: Math.round((distribution.High / total) * 100) },
    },
    highRiskEmployees,
  };
}

/**
 * Compute weekly productivity trends from embedded activity logs.
 * Groups all employees' logs into calendar weeks and averages.
 */
function computeWeeklyTrends(employees) {
  const weekMap = {};

  employees.forEach(emp => {
    (emp.activityLogs || []).forEach(log => {
      const date = new Date(log.date);
      // Generate a week key like "2026-W14"
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getMonth() * 30 + weekStart.getDate()) / 7)).padStart(2, '0')}`;

      if (!weekMap[key]) {
        weekMap[key] = { totalTasks: 0, totalHours: 0, count: 0 };
      }
      weekMap[key].totalTasks += log.tasksCompleted || 0;
      weekMap[key].totalHours += log.hoursWorked || 0;
      weekMap[key].count      += 1;
    });
  });

  return Object.entries(weekMap)
    .map(([week, data]) => ({
      week,
      avgTasks: Math.round(data.totalTasks / data.count * 10) / 10,
      avgHours: Math.round(data.totalHours / data.count * 10) / 10,
      // Productivity score = (tasks / hours) normalized to 0-100
      score: Math.min(100, Math.round((data.totalTasks / Math.max(data.totalHours, 1)) * 12.5 * 10)),
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-10); // last 10 weeks
}

/**
 * Detect anomalies using simple threshold-based logic.
 * Flags employees with concerning patterns.
 */
async function detectAnomalies() {
  const employees = await Employee.find({ status: 'Active' });
  const anomalies = [];

  employees.forEach(emp => {
    const logs = (emp.activityLogs || []).slice(-7);
    if (logs.length === 0) return;

    const avgHours = logs.reduce((s, l) => s + l.hoursWorked, 0) / logs.length;
    const avgTasks = logs.reduce((s, l) => s + l.tasksCompleted, 0) / logs.length;

    // ── Threshold-based anomaly detection ──
    if (avgHours > 10) {
      anomalies.push({
        employeeId:  emp._id,
        name:        emp.name,
        department:  emp.department,
        type:        'excessive_hours',
        severity:    'High',
        description: `Averaging ${avgHours.toFixed(1)} hours/day — significantly above healthy threshold`,
        value:       avgHours,
      });
    }

    if (emp.sentimentScore < 40) {
      anomalies.push({
        employeeId:  emp._id,
        name:        emp.name,
        department:  emp.department,
        type:        'low_sentiment',
        severity:    'High',
        description: `Sentiment score of ${emp.sentimentScore} is critically low`,
        value:       emp.sentimentScore,
      });
    }

    if (emp.workload > 120) {
      anomalies.push({
        employeeId:  emp._id,
        name:        emp.name,
        department:  emp.department,
        type:        'overloaded',
        severity:    'Medium',
        description: `Workload at ${emp.workload}% of capacity`,
        value:       emp.workload,
      });
    }

    // Productivity declining while hours increasing = dangerous pattern
    if (emp.productivityScore < 70 && avgHours > 9) {
      anomalies.push({
        employeeId:  emp._id,
        name:        emp.name,
        department:  emp.department,
        type:        'declining_efficiency',
        severity:    'High',
        description: 'Low productivity despite long hours — strong burnout indicator',
        value:       emp.productivityScore,
      });
    }
  });

  return anomalies.sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return (order[a.severity] || 2) - (order[b.severity] || 2);
  });
}

module.exports = {
  getProductivityAnalytics,
  getBurnoutAnalytics,
  detectAnomalies,
};
