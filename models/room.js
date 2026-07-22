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
}

module.exports = Room;
