const Employee = require('../models/Employee');

// ────────────────────────────────────────────────────────────
//  Employee Controller
//  CRUD operations + activity log management.
// ────────────────────────────────────────────────────────────

/**
 * GET /api/employees
 * Fetch all employees with optional filters.
 * Query params: ?department=Engineering&risk=High&status=Active
 */
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, risk, status, search } = req.query;
    const filter = {};

    if (department && department !== 'All') filter.department = department;
    if (risk && risk !== 'All')             filter.burnoutRisk = risk;
    if (status && status !== 'All')         filter.status = status;
    if (search) {
      filter.$or = [
        { name:       { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { role:       { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude heavy activityLogs from list endpoint for performance
    const employees = await Employee.find(filter)
      .select('-activityLogs -lastAIInsight.rawResponse')
      .sort({ burnoutRisk: -1, productivityScore: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
};

/**
 * GET /api/employees/:id
 * Fetch single employee with full activity logs.
 */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch employee' });
  }
};

/**
 * POST /api/employees
 * Create a new employee.
 */
exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/employees/:id
 * Update employee data.
 */
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/employees/:id/activity
 * Add an activity log entry to an employee's record.
 */
exports.addActivityLog = async (req, res) => {
  try {
    const { date, tasksCompleted, hoursWorked, meetingHours, sentimentScore } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    employee.activityLogs.push({
      date: date || new Date(),
      tasksCompleted: tasksCompleted || 0,
      hoursWorked:    hoursWorked || 0,
      meetingHours:   meetingHours || 0,
      sentimentScore: sentimentScore || 70,
    });

    // ── Auto-recalculate productivity score from recent logs ──
    const recentLogs = employee.activityLogs.slice(-14); // last 2 weeks
    if (recentLogs.length > 0) {
      const avgTasks = recentLogs.reduce((s, l) => s + l.tasksCompleted, 0) / recentLogs.length;
      const avgHours = recentLogs.reduce((s, l) => s + l.hoursWorked, 0) / recentLogs.length;
      // Normalize: ~5 tasks in 8 hours = 100%
      employee.productivityScore = Math.min(100, Math.round((avgTasks / Math.max(avgHours, 1)) * 160));

      // ── Auto-update burnout risk ──
      const avgSentiment = recentLogs.reduce((s, l) => s + (l.sentimentScore || 70), 0) / recentLogs.length;
      employee.sentimentScore = Math.round(avgSentiment);

      if (avgHours > 10 || avgSentiment < 40 || employee.workload > 120) {
        employee.burnoutRisk = 'High';
      } else if (avgHours > 9 || avgSentiment < 55 || employee.workload > 100) {
        employee.burnoutRisk = 'Medium';
      } else {
        employee.burnoutRisk = 'Low';
      }
    }

    await employee.save();
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error adding activity log:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};
