const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Room {
    static async getAll() {
        const result = await query('SELECT * FROM rooms ORDER BY name ASC');
        return result.rows;
    }

    static async getById(id) {
        const result = await query('SELECT * FROM rooms WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByIdWithDetails(id) {
        const result = await query(`
            SELECT r.*, 
                   b.id as building_id, 
                   b.name as building_name,
                   o.id as organization_id,
                   o.name as organization_name
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            WHERE r.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async getByBuilding(buildingId) {
        const result = await query(
            'SELECT * FROM rooms WHERE building_id = $1 ORDER BY name ASC',
            [buildingId]
        );
        return result.rows;
    }

    static async getByOrganization(organizationId) {
        const result = await query(`
            SELECT r.* 
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            WHERE b.organization_id = $1
            ORDER BY r.name ASC
        `, [organizationId]);
        return result.rows;
    }

    static async create(data) {
        const { name, description, capacity, building_id } = data;
        const id = uuidv4();
        const result = await query(
            'INSERT INTO rooms (id, name, description, capacity, building_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, name, description, capacity, building_id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { name, description, capacity, building_id } = data;
        const result = await query(
            'UPDATE rooms SET name = $1, description = $2, capacity = $3, building_id = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [name, description, capacity, building_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getWithDetails() {
        const result = await query(`
            SELECT r.*, b.name as building_name, o.name as organization_name,
                   COUNT(i.id) as item_count
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            LEFT JOIN inventory_items i ON r.id = i.room_id
            GROUP BY r.id, b.name, o.name
            ORDER BY o.name, b.name, r.name
        `);
        return result.rows;
    }

    static async getFiltered(options = {}) {
        const { search, organizationId, buildingId, page = 1, limit = 100 } = options;
        const offset = (page - 1) * limit;
        
        let queryStr = `
            SELECT r.*, b.name as building_name, o.name as organization_name,
                   COUNT(i.id) as item_count
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            LEFT JOIN inventory_items i ON r.id = i.room_id
        `;
        
        const params = [];
        const conditions = [];
        
        if (search) {
            conditions.push(`(r.name ILIKE $${params.length + 1} OR r.description ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }
        
        if (organizationId) {
            conditions.push(`o.id = $${params.length + 1}`);
            params.push(organizationId);
        }
        
        if (buildingId) {
            conditions.push(`b.id = $${params.length + 1}`);
            params.push(buildingId);
        }
        
        if (conditions.length > 0) {
            queryStr += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        queryStr += `
            GROUP BY r.id, b.name, o.name
            ORDER BY o.name, b.name, r.name
            LIMIT $${params.length + 1}
            OFFSET $${params.length + 2}
        `;
        params.push(limit, offset);
        
        const result = await query(queryStr, params);
        return result.rows;
    }

    static async countFiltered(options = {}) {
        const { search, organizationId, buildingId } = options;
        
        let queryStr = `
            SELECT COUNT(r.id) as total
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
        `;
        
        const params = [];
        const conditions = [];
        
        if (search) {
            conditions.push(`(r.name ILIKE $${params.length + 1} OR r.description ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }
        
        if (organizationId) {
            conditions.push(`o.id = $${params.length + 1}`);
            params.push(organizationId);
        }
        
        if (buildingId) {
            conditions.push(`b.id = $${params.length + 1}`);
            params.push(buildingId);
        }
        
        if (conditions.length > 0) {
            queryStr += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        const result = await query(queryStr, params);
        return parseInt(result.rows[0].total) || 0;
    }
}

module.exports = Room;
