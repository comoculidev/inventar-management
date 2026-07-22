const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', DashboardController.getStats);

// GET /api/dashboard/detailed - Get detailed dashboard statistics
router.get('/detailed', DashboardController.getDetailedStats);

module.exports = router;
