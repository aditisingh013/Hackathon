export const kpiData = {
  totalEmployees: 412,
  productivityScore: 84,
  burnoutRisk: 12,
  activeTasks: 1248,
  scoreChange: '+2.4%',
  burnoutChange: '-1.2%'
};

export const productivityTrends = [
  { name: 'Week 1', score: 75, baseline: 70 },
  { name: 'Week 2', score: 78, baseline: 70 },
  { name: 'Week 3', score: 81, baseline: 70 },
  { name: 'Week 4', score: 80, baseline: 70 },
  { name: 'Week 5', score: 85, baseline: 70 },
  { name: 'Week 6', score: 84, baseline: 70 }
];

export const departmentProductivity = [
  { name: 'Engineering', score: 88, workload: 92 },
  { name: 'Marketing', score: 76, workload: 65 },
  { name: 'Sales', score: 82, workload: 78 },
  { name: 'HR', score: 90, workload: 60 },
  { name: 'Design', score: 85, workload: 80 }
];

export const burnoutDistribution = [
  { name: 'Low Risk', value: 65, color: '#10b981' }, 
  { name: 'Medium Risk', value: 23, color: '#f59e0b' },
  { name: 'High Risk', value: 12, color: '#ef4444' }
];

export const recentAlerts = [
  { id: 1, title: 'High Burnout Detected', desc: 'Engineering Dept - Team Alpha has clocked 50+ hours this week.', severity: 'High', time: '10 mins ago' },
  { id: 2, title: 'Productivity Dip', desc: 'Marketing Dept showing 15% drop in task completion.', severity: 'Medium', time: '2 hours ago' },
  { id: 3, title: 'AI Recommendation', desc: 'Consider approving pending leaves for 3 employees in Sales.', severity: 'Low', time: '5 hours ago' }
];

export const employees = [
  { id: 101, name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=101', role: 'Senior Developer', department: 'Engineering', productivity: 95, burnoutRisk: 'High', status: 'Active' },
  { id: 102, name: 'Samantha Lee', avatar: 'https://i.pravatar.cc/150?u=102', role: 'UX Designer', department: 'Design', productivity: 82, burnoutRisk: 'Low', status: 'Active' },
  { id: 103, name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=103', role: 'Marketing Manager', department: 'Marketing', productivity: 68, burnoutRisk: 'Medium', status: 'On Leave' },
  { id: 104, name: 'Emily Davis', avatar: 'https://i.pravatar.cc/150?u=104', role: 'HR Specialist', department: 'HR', productivity: 92, burnoutRisk: 'Low', status: 'Active' },
  { id: 105, name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=105', role: 'Backend Engineer', department: 'Engineering', productivity: 78, burnoutRisk: 'High', status: 'Active' }
];

export const recommendationCards = [
  { id: 1, title: 'Reassign Workload', text: 'Alex Johnson has 15 active tickets. Redistribute 5 issues to Team Beta.', action: 'Review Tasks' },
  { id: 2, title: 'Mandatory Break', text: 'James Wilson has logged in on weekends for 3 consecutive weeks.', action: 'Suggest Leave' },
  { id: 3, title: 'Team Building', text: 'Marketing overall morale score has dipped by 8%.', action: 'Schedule Event' }
];
