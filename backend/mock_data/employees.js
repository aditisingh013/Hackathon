// ============================================================
//  MOCK DATA — Realistic employee records for seeding MongoDB
//  Includes 30 days of activity logs per employee
// ============================================================

/**
 * Generate N days of activity logs ending today.
 * Creates realistic patterns — some employees overwork,
 * some have declining sentiment, etc.
 */
function generateActivityLogs(days, pattern = 'normal') {
  const logs = [];
  const now  = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    let hours, tasks, sentiment;

    switch (pattern) {
      case 'overworked':
        // Consistently high hours, declining sentiment
        hours     = 10 + Math.random() * 4;                    // 10-14h
        tasks     = 4 + Math.floor(Math.random() * 4);         // 4-7
        sentiment = Math.max(20, 45 - i * 0.5 + Math.random() * 10); // declining
        break;

      case 'underperforming':
        // Normal hours but low task completion
        hours     = 7 + Math.random() * 2;                     // 7-9h
        tasks     = 1 + Math.floor(Math.random() * 3);         // 1-3
        sentiment = 40 + Math.random() * 20;                   // 40-60
        break;

      case 'healthy':
        // Ideal balance
        hours     = 7.5 + Math.random() * 1.5;                 // 7.5-9h
        tasks     = 4 + Math.floor(Math.random() * 4);         // 4-7
        sentiment = 70 + Math.random() * 20;                   // 70-90
        break;

      case 'improving':
        // Getting better over time
        hours     = 9 - (i / days) * 2 + Math.random();
        tasks     = 3 + Math.floor((1 - i / days) * 4 + Math.random() * 2);
        sentiment = 50 + (1 - i / days) * 30 + Math.random() * 10;
        break;

      default: // normal
        hours     = 8 + Math.random() * 2;
        tasks     = 3 + Math.floor(Math.random() * 5);
        sentiment = 60 + Math.random() * 25;
        break;
    }

    logs.push({
      date,
      tasksCompleted: Math.round(tasks),
      hoursWorked:    Math.round(hours * 10) / 10,
      meetingHours:   Math.round((1 + Math.random() * 2) * 10) / 10,
      sentimentScore: Math.round(sentiment),
    });
  }

  return logs;
}

const mockEmployees = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=101',
    manager: 'Sarah Connors',
    joinDate: 'March 2021',
    status: 'Active',
    productivityScore: 95,
    burnoutRisk: 'High',
    workload: 130,
    sentimentScore: 38,
    activityLogs: generateActivityLogs(30, 'overworked'),
  },
  {
    name: 'Samantha Lee',
    email: 'samantha.lee@company.com',
    role: 'UX Designer',
    department: 'Design',
    avatar: 'https://i.pravatar.cc/150?u=102',
    manager: 'Kevin Park',
    joinDate: 'June 2022',
    status: 'Active',
    productivityScore: 82,
    burnoutRisk: 'Low',
    workload: 75,
    sentimentScore: 74,
    activityLogs: generateActivityLogs(30, 'healthy'),
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'Marketing Manager',
    department: 'Marketing',
    avatar: 'https://i.pravatar.cc/150?u=103',
    manager: 'Rachel Kim',
    joinDate: 'January 2020',
    status: 'On Leave',
    productivityScore: 68,
    burnoutRisk: 'Medium',
    workload: 100,
    sentimentScore: 55,
    activityLogs: generateActivityLogs(30, 'underperforming'),
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'HR Specialist',
    department: 'HR',
    avatar: 'https://i.pravatar.cc/150?u=104',
    manager: 'Tom Walsh',
    joinDate: 'August 2019',
    status: 'Active',
    productivityScore: 92,
    burnoutRisk: 'Low',
    workload: 70,
    sentimentScore: 88,
    activityLogs: generateActivityLogs(30, 'healthy'),
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'Backend Engineer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=105',
    manager: 'Sarah Connors',
    joinDate: 'November 2020',
    status: 'Active',
    productivityScore: 78,
    burnoutRisk: 'High',
    workload: 135,
    sentimentScore: 30,
    activityLogs: generateActivityLogs(30, 'overworked'),
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    role: 'Sales Executive',
    department: 'Sales',
    avatar: 'https://i.pravatar.cc/150?u=106',
    manager: 'David Brooks',
    joinDate: 'April 2022',
    status: 'Active',
    productivityScore: 76,
    burnoutRisk: 'Medium',
    workload: 110,
    sentimentScore: 60,
    activityLogs: generateActivityLogs(30, 'normal'),
  },
  {
    name: 'David Martinez',
    email: 'david.martinez@company.com',
    role: 'DevOps Engineer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=107',
    manager: 'Sarah Connors',
    joinDate: 'February 2023',
    status: 'Active',
    productivityScore: 88,
    burnoutRisk: 'Low',
    workload: 85,
    sentimentScore: 72,
    activityLogs: generateActivityLogs(30, 'healthy'),
  },
  {
    name: 'Sophie Turner',
    email: 'sophie.turner@company.com',
    role: 'Product Designer',
    department: 'Design',
    avatar: 'https://i.pravatar.cc/150?u=108',
    manager: 'Kevin Park',
    joinDate: 'September 2021',
    status: 'Active',
    productivityScore: 85,
    burnoutRisk: 'Medium',
    workload: 95,
    sentimentScore: 58,
    activityLogs: generateActivityLogs(30, 'normal'),
  },
  {
    name: 'Ryan Cooper',
    email: 'ryan.cooper@company.com',
    role: 'Financial Analyst',
    department: 'Finance',
    avatar: 'https://i.pravatar.cc/150?u=109',
    manager: 'Lisa Chen',
    joinDate: 'July 2020',
    status: 'Active',
    productivityScore: 79,
    burnoutRisk: 'Low',
    workload: 80,
    sentimentScore: 75,
    activityLogs: generateActivityLogs(30, 'healthy'),
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.patel@company.com',
    role: 'QA Engineer',
    department: 'Engineering',
    avatar: 'https://i.pravatar.cc/150?u=110',
    manager: 'Sarah Connors',
    joinDate: 'May 2022',
    status: 'Active',
    productivityScore: 71,
    burnoutRisk: 'Medium',
    workload: 105,
    sentimentScore: 52,
    activityLogs: generateActivityLogs(30, 'improving'),
  },
];

module.exports = mockEmployees;
