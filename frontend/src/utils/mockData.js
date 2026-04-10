// ============================================================
//  MOCK DATA — Intelligent Burnout Analytics System
//  Apple-clean data – only essential fields, no clutter
// ============================================================

/* ── Dashboard KPIs ── */
export const kpiData = {
  totalEmployees: 412,
  productivityScore: 84,
  burnoutRisk: 12,
  activeTasks: 1248,
  scoreChange: '+2.4%',
  burnoutChange: '-1.2%',
  taskChange: '+8.1%',
  empChange: '+3',
};

/* ── 10-week productivity trend (line/area chart) ── */
export const productivityTrends = [
  { name: 'Jan W1', score: 72, baseline: 70 },
  { name: 'Jan W2', score: 68, baseline: 70 },
  { name: 'Jan W3', score: 75, baseline: 70 },
  { name: 'Feb W1', score: 78, baseline: 70 },
  { name: 'Feb W2', score: 76, baseline: 70 },
  { name: 'Feb W3', score: 80, baseline: 70 },
  { name: 'Mar W1', score: 81, baseline: 70 },
  { name: 'Mar W2', score: 85, baseline: 70 },
  { name: 'Mar W3', score: 83, baseline: 70 },
  { name: 'Apr W1', score: 84, baseline: 70 },
];

/* ── Department bar chart ── */
export const departmentProductivity = [
  { name: 'Engineering', score: 88, workload: 92 },
  { name: 'Marketing',   score: 76, workload: 65 },
  { name: 'Sales',       score: 82, workload: 78 },
  { name: 'HR',          score: 90, workload: 55 },
  { name: 'Design',      score: 85, workload: 80 },
  { name: 'Finance',     score: 79, workload: 60 },
];

/* ── Burnout donut chart ── */
export const burnoutDistribution = [
  { name: 'Low Risk',    value: 65, color: '#34c759' },
  { name: 'Medium Risk', value: 23, color: '#ff9500' },
  { name: 'High Risk',   value: 12, color: '#ff3b30' },
];

/* ── Alerts ── */
export const recentAlerts = [
  {
    id: 1,
    title: 'Critical Burnout Detected',
    desc: 'Engineering Team Alpha has averaged 58 hours/week for 3 weeks. Immediate intervention recommended.',
    severity: 'High',
    time: '10 mins ago',
    department: 'Engineering',
  },
  {
    id: 2,
    title: 'Productivity Anomaly',
    desc: 'Marketing dept shows a 15% week-over-week drop in task completion rate.',
    severity: 'Medium',
    time: '2 hours ago',
    department: 'Marketing',
  },
  {
    id: 3,
    title: 'Leave Approval Suggested',
    desc: 'AI flagged 3 Sales employees with declining morale scores. Approving pending leaves may help.',
    severity: 'Low',
    time: '5 hours ago',
    department: 'Sales',
  },
  {
    id: 4,
    title: 'Weekend Login Pattern',
    desc: 'James Wilson logged in on all 4 consecutive weekends. Risk escalation likely.',
    severity: 'High',
    time: '1 day ago',
    department: 'Engineering',
  },
  {
    id: 5,
    title: 'Sentiment Score Drop',
    desc: 'Design team survey sentiment fell below threshold (42/100). Team-building event recommended.',
    severity: 'Medium',
    time: '2 days ago',
    department: 'Design',
  },
];

/* ── Employees ── */
export const employees = [
  {
    id: 101,
    name: 'Alex Johnson',
    avatar: 'https://i.pravatar.cc/150?u=101',
    role: 'Senior Developer',
    department: 'Engineering',
    productivity: 95,
    burnoutRisk: 'High',
    status: 'Active',
    hoursThisWeek: 58,
    tasksCompleted: 24,
    sentimentScore: 38,
    email: 'alex.johnson@company.com',
    joinDate: 'March 2021',
    manager: 'Sarah Connors',
    activityTimeline: [
      { day: 'Mon', hours: 10, tasks: 5 },
      { day: 'Tue', hours: 12, tasks: 6 },
      { day: 'Wed', hours: 11, tasks: 5 },
      { day: 'Thu', hours: 13, tasks: 7 },
      { day: 'Fri', hours: 9,  tasks: 4 },
    ],
    recommendations: [
      { title: 'Redistribute Tasks', text: 'Alex has 15 active tickets — redistribute 5 to Team Beta to reduce overload.', action: 'Review Tasks', type: 'workload' },
      { title: 'Approve Leave Request', text: 'Pending 2-day leave since March 28 not approved. Approving may prevent further burnout.', action: 'Approve Leave', type: 'break' },
    ],
  },
  {
    id: 102,
    name: 'Samantha Lee',
    avatar: 'https://i.pravatar.cc/150?u=102',
    role: 'UX Designer',
    department: 'Design',
    productivity: 82,
    burnoutRisk: 'Low',
    status: 'Active',
    hoursThisWeek: 42,
    tasksCompleted: 18,
    sentimentScore: 74,
    email: 'samantha.lee@company.com',
    joinDate: 'June 2022',
    manager: 'Kevin Park',
    activityTimeline: [
      { day: 'Mon', hours: 8, tasks: 4 },
      { day: 'Tue', hours: 9, tasks: 4 },
      { day: 'Wed', hours: 8, tasks: 3 },
      { day: 'Thu', hours: 9, tasks: 4 },
      { day: 'Fri', hours: 8, tasks: 3 },
    ],
    recommendations: [
      { title: 'Recognize Achievement', text: 'Samantha has been consistently meeting deadlines. A public shoutout could boost morale.', action: 'Send Recognition', type: 'morale' },
    ],
  },
  {
    id: 103,
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?u=103',
    role: 'Marketing Manager',
    department: 'Marketing',
    productivity: 68,
    burnoutRisk: 'Medium',
    status: 'On Leave',
    hoursThisWeek: 35,
    tasksCompleted: 11,
    sentimentScore: 55,
    email: 'michael.chen@company.com',
    joinDate: 'January 2020',
    manager: 'Rachel Kim',
    activityTimeline: [
      { day: 'Mon', hours: 7, tasks: 3 },
      { day: 'Tue', hours: 6, tasks: 2 },
      { day: 'Wed', hours: 8, tasks: 3 },
      { day: 'Thu', hours: 7, tasks: 2 },
      { day: 'Fri', hours: 7, tasks: 1 },
    ],
    recommendations: [
      { title: 'Schedule 1-on-1', text: 'Discuss roadblocks and goal clarity to address the productivity drop.', action: 'Schedule Meeting', type: 'morale' },
      { title: 'Reassign Campaign', text: 'Current sprint load is above capacity. Reassign Q2 campaign ownership.', action: 'Reassign Task', type: 'workload' },
    ],
  },
  {
    id: 104,
    name: 'Emily Davis',
    avatar: 'https://i.pravatar.cc/150?u=104',
    role: 'HR Specialist',
    department: 'HR',
    productivity: 92,
    burnoutRisk: 'Low',
    status: 'Active',
    hoursThisWeek: 40,
    tasksCompleted: 22,
    sentimentScore: 88,
    email: 'emily.davis@company.com',
    joinDate: 'August 2019',
    manager: 'Tom Walsh',
    activityTimeline: [
      { day: 'Mon', hours: 8, tasks: 5 },
      { day: 'Tue', hours: 8, tasks: 4 },
      { day: 'Wed', hours: 8, tasks: 5 },
      { day: 'Thu', hours: 8, tasks: 4 },
      { day: 'Fri', hours: 8, tasks: 4 },
    ],
    recommendations: [
      { title: 'Promote Growth', text: 'Emily is performing exceptionally. Consider her for team lead responsibility.', action: 'Start Review', type: 'growth' },
    ],
  },
  {
    id: 105,
    name: 'James Wilson',
    avatar: 'https://i.pravatar.cc/150?u=105',
    role: 'Backend Engineer',
    department: 'Engineering',
    productivity: 78,
    burnoutRisk: 'High',
    status: 'Active',
    hoursThisWeek: 54,
    tasksCompleted: 17,
    sentimentScore: 30,
    email: 'james.wilson@company.com',
    joinDate: 'November 2020',
    manager: 'Sarah Connors',
    activityTimeline: [
      { day: 'Mon', hours: 11, tasks: 4 },
      { day: 'Tue', hours: 10, tasks: 3 },
      { day: 'Wed', hours: 12, tasks: 4 },
      { day: 'Thu', hours: 11, tasks: 3 },
      { day: 'Fri', hours: 10, tasks: 3 },
    ],
    recommendations: [
      { title: 'Mandatory Rest Day', text: 'James has logged in on weekends for 4 weeks. A mandatory offline day is overdue.', action: 'Enforce Break', type: 'break' },
      { title: 'Reduce Sprint Load', text: 'Current sprint capacity is at 130%. Reduce to 100% to avoid further degradation.', action: 'Update Sprint', type: 'workload' },
    ],
  },
  {
    id: 106,
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?u=106',
    role: 'Sales Executive',
    department: 'Sales',
    productivity: 76,
    burnoutRisk: 'Medium',
    status: 'Active',
    hoursThisWeek: 46,
    tasksCompleted: 14,
    sentimentScore: 60,
    email: 'priya.sharma@company.com',
    joinDate: 'April 2022',
    manager: 'David Brooks',
    activityTimeline: [
      { day: 'Mon', hours: 9, tasks: 3 },
      { day: 'Tue', hours: 10, tasks: 3 },
      { day: 'Wed', hours: 9,  tasks: 3 },
      { day: 'Thu', hours: 10, tasks: 3 },
      { day: 'Fri', hours: 8,  tasks: 2 },
    ],
    recommendations: [
      { title: 'Team Building', text: 'Morale within Sales team is dropping. Schedule a team event or off-site.', action: 'Plan Event', type: 'morale' },
    ],
  },
];

/* ── Org-wide AI recommendations ── */
export const orgRecommendations = [
  {
    id: 1,
    title: 'Redistribute Engineering Workload',
    text: 'Engineering dept is at 130% capacity. Shift 10% of sprint tasks to contractors or the next sprint.',
    action: 'View Sprint Plan',
    type: 'workload',
    affectedCount: 8,
    priority: 'High',
  },
  {
    id: 2,
    title: 'Implement No-Meeting Fridays',
    text: 'Data shows Friday productivity spikes 18% on weeks with fewer meetings. Formalize this policy.',
    action: 'Draft Policy',
    type: 'break',
    affectedCount: 412,
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Marketing Team Morale Boost',
    text: 'Sentiment scores for marketing fell to 42/100. A team-building event is forecasted to raise morale by 25%.',
    action: 'Schedule Event',
    type: 'morale',
    affectedCount: 14,
    priority: 'Medium',
  },
  {
    id: 4,
    title: 'Mandatory Leave for At-Risk Employees',
    text: '5 employees flagged as critical burnout risk have unused leave days. Human-force approvals required.',
    action: 'Review Leaves',
    type: 'break',
    affectedCount: 5,
    priority: 'High',
  },
  {
    id: 5,
    title: 'Promote Top Performers',
    text: 'HR & Design are consistently outperforming. Providing growth opportunities can retain talent long-term.',
    action: 'Start Reviews',
    type: 'growth',
    affectedCount: 12,
    priority: 'Low',
  },
];
