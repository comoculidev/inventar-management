const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Building {
    static async getAll() {
        const result = await query('SELECT * FROM buildings ORDER BY name ASC');
        return result.rows;
    }

    static async getById(id) {
        const result = await query('SELECT * FROM buildings WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByOrganization(organizationId) {
        const result = await query(
            'SELECT * FROM buildings WHERE organization_id = $1 ORDER BY name ASC',
            [organizationId]
        );
        return result.rows;
    }

    static async create(data) {
        const { name, description, organization_id } = data;
        const id = uuidv4();
        const result = await query(
            'INSERT INTO buildings (id, name, description, organization_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, description, organization_id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { name, description, organization_id } = data;
        const result = await query(
            'UPDATE buildings SET name = $1, description = $2, organization_id = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
            [name, description, organization_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query('DELETE FROM buildings WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getWithOrganization() {
        const result = await query(`
            SELECT b.*, o.name as organization_name
            FROM buildings b
            JOIN organizations o ON b.organization_id = o.id
            ORDER BY o.name, b.name
        `);
        return result.rows;
    }
}

module.exports = Building;
