const express = require('express');
const router = express.Router();
const HistoryLogsController = require('../controllers/historyLogsController');

// GET /api/history - List all history logs
router.get('/', HistoryLogsController.getAll);

// GET /api/history/paginated - Get paginated history logs
router.get('/paginated', HistoryLogsController.getPaginated);

// GET /api/history/:id - Get single history log
router.get('/:id', HistoryLogsController.getById);

// GET /api/history/date-range - Get logs by date range
router.get('/date-range', HistoryLogsController.getByDateRange);

// GET /api/history/action/:actionType - Get logs by action type
router.get('/action/:actionType', HistoryLogsController.getByActionType);

// GET /api/history/organization/:organizationId - Get logs by organization
router.get('/organization/:organizationId', HistoryLogsController.getByOrganization);

// GET /api/history/building/:buildingId - Get logs by building
router.get('/building/:buildingId', HistoryLogsController.getByBuilding);

// GET /api/history/room/:roomId - Get logs by room
router.get('/room/:roomId', HistoryLogsController.getByRoom);

// POST /api/history - Create new history log
router.post('/', HistoryLogsController.create);

module.exports = router;
