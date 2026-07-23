const HistoryLog = require('../models/historyLog');

class HistoryLogsController {
    static async getAll(req, res) {
        try {
            const logs = await HistoryLog.getAll();
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching history logs:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const log = await HistoryLog.getById(id);
            
            if (!log) {
                return res.status(404).json({
                    success: false,
                    error: 'History log not found'
                });
            }
            
            res.json({
                success: true,
                data: log
            });
        } catch (error) {
            console.error('Error fetching history log:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const data = req.body;
            
            if (!data.action_type) {
                return res.status(400).json({
                    success: false,
                    error: 'action_type is required'
                });
            }
            
            const log = await HistoryLog.create(data);
            
            res.status(201).json({
                success: true,
                data: log
            });
        } catch (error) {
            console.error('Error creating history log:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByDateRange(req, res) {
        try {
            const { startDate, endDate, actionType, search, page = 1, limit = 50 } = req.query;
            
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required'
                });
            }
            
            const options = {
                actionType,
                search,
                page: parseInt(page),
                limit: parseInt(limit)
            };
            
            const logs = await HistoryLog.getByDateRange(startDate, endDate, options);
            const total = await HistoryLog.countByDateRange(startDate, endDate, options);
            
            res.json({
                success: true,
                data: logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching history logs by date range:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByActionType(req, res) {
        try {
            const { actionType } = req.params;
            const logs = await HistoryLog.getByActionType(actionType);
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching history logs by action type:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByOrganization(req, res) {
        try {
            const { organizationId } = req.params;
            const logs = await HistoryLog.getByOrganization(organizationId);
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching history logs by organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByBuilding(req, res) {
        try {
            const { buildingId } = req.params;
            const logs = await HistoryLog.getByBuilding(buildingId);
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching history logs by building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByRoom(req, res) {
        try {
            const { roomId } = req.params;
            const logs = await HistoryLog.getByRoom(roomId);
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching history logs by room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getPaginated(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const logs = await HistoryLog.getPaginated(parseInt(page), parseInt(limit));
            
            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error fetching paginated history logs:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = HistoryLogsController;
