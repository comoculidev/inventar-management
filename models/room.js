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
            SELECT r.*, b.name as building_name, o.name as organization_name
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            ORDER BY o.name, b.name, r.name
        `);
        return result.rows;
    }

    static async getWithItemCounts() {
        const result = await query(`
            SELECT r.*, 
                   b.name as building_name, 
                   o.name as organization_name,
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

    static async getFiltered({ search = '', organizationId = '', buildingId = '', page = 1, limit = 10 }) {
        let queryText = `
            SELECT r.*, 
                   b.name as building_name, 
                   o.name as organization_name,
                   COUNT(i.id) as item_count
            FROM rooms r
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            LEFT JOIN inventory_items i ON r.id = i.room_id
        `;
        
        const params = [];
        let paramIndex = 1;
        const conditions = [];
        
        if (search) {
            conditions.push(`(r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex} OR b.name ILIKE $${paramIndex} OR o.name ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (organizationId) {
            conditions.push(`o.id = $${paramIndex}`);
            params.push(organizationId);
            paramIndex++;
        }
        
        if (buildingId) {
            conditions.push(`b.id = $${paramIndex}`);
            params.push(buildingId);
            paramIndex++;
        }
        
        if (conditions.length > 0) {
            queryText += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        queryText += `
            GROUP BY r.id, b.name, o.name
            ORDER BY o.name, b.name, r.name
        `;
        
        // Get total count
        const countQuery = `SELECT COUNT(*) FROM (${queryText}) AS subquery`;
        const countResult = await query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);
        
        // Add pagination
        const offset = (page - 1) * limit;
        queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
        
        const result = await query(queryText, params);
        
        return {
            rooms: result.rows,
            total
        };
    }
}

module.exports = Room;
