const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class HistoryLog {
    static async getAll() {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            ORDER BY hl.created_at DESC
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async create(data) {
        const { 
            organization_id, 
            building_id, 
            room_id, 
            responsible_person, 
            action_type, 
            old_values = null, 
            new_values = null 
        } = data;
        
        const id = uuidv4();
        const result = await query(
            `INSERT INTO history_logs 
                (id, organization_id, building_id, room_id, responsible_person, action_type, old_values, new_values)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [id, organization_id, building_id, room_id, responsible_person, action_type, old_values, new_values]
        );
        return result.rows[0];
    }

    static async getByDateRange(startDate, endDate, options = {}) {
        const { actionType, search, page = 1, limit = 50 } = options;
        const offset = (page - 1) * limit;
        
        let queryStr = `
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.created_at BETWEEN $1 AND $2
        `;
        
        const params = [startDate, endDate];
        
        if (actionType) {
            queryStr += ` AND hl.action_type = $${params.length + 1}`;
            params.push(actionType);
        }
        
        if (search) {
            queryStr += `
                AND (o.name ILIKE $${params.length + 1} 
                     OR b.name ILIKE $${params.length + 1}
                     OR r.name ILIKE $${params.length + 1}
                     OR hl.responsible_person ILIKE $${params.length + 1})
            `;
            params.push(`%${search}%`);
        }
        
        queryStr += ` ORDER BY hl.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await query(queryStr, params);
        return result.rows;
    }

    static async countByDateRange(startDate, endDate, options = {}) {
        const { actionType, search } = options;
        
        let queryStr = `
            SELECT COUNT(hl.id) as total
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.created_at BETWEEN $1 AND $2
        `;
        
        const params = [startDate, endDate];
        
        if (actionType) {
            queryStr += ` AND hl.action_type = $${params.length + 1}`;
            params.push(actionType);
        }
        
        if (search) {
            queryStr += `
                AND (o.name ILIKE $${params.length + 1} 
                     OR b.name ILIKE $${params.length + 1}
                     OR r.name ILIKE $${params.length + 1}
                     OR hl.responsible_person ILIKE $${params.length + 1})
            `;
            params.push(`%${search}%`);
        }
        
        const result = await query(queryStr, params);
        return parseInt(result.rows[0].total) || 0;
    }

    static async getByActionType(actionType) {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.action_type = $1
            ORDER BY hl.created_at DESC
        `, [actionType]);
        return result.rows;
    }

    static async getPaginated(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            ORDER BY hl.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
        return result.rows;
    }

    static async getByOrganization(organizationId) {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.organization_id = $1
            ORDER BY hl.created_at DESC
        `, [organizationId]);
        return result.rows;
    }

    static async getByBuilding(buildingId) {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.building_id = $1
            ORDER BY hl.created_at DESC
        `, [buildingId]);
        return result.rows;
    }

    static async getByRoom(roomId) {
        const result = await query(`
            SELECT hl.*, 
                   o.name as organization_name,
                   b.name as building_name,
                   r.name as room_name
            FROM history_logs hl
            LEFT JOIN organizations o ON hl.organization_id = o.id
            LEFT JOIN buildings b ON hl.building_id = b.id
            LEFT JOIN rooms r ON hl.room_id = r.id
            WHERE hl.room_id = $1
            ORDER BY hl.created_at DESC
        `, [roomId]);
        return result.rows;
    }
}

module.exports = HistoryLog;
