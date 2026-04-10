const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employeeController');

// ── Employee CRUD ──
router.get('/',     ctrl.getAllEmployees);   // GET /api/employees
router.post('/',    ctrl.createEmployee);    // POST /api/employees
router.get('/:id',  ctrl.getEmployeeById);   // GET /api/employees/:id
router.put('/:id',  ctrl.updateEmployee);    // PUT /api/employees/:id

// ── Activity Log ingestion ──
router.post('/:id/activity', ctrl.addActivityLog); // POST /api/employees/:id/activity

module.exports = router;
