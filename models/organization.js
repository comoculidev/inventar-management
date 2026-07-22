const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class Organization {
    static async getAll() {
        const result = await query('SELECT * FROM organizations ORDER BY name ASC');
        return result.rows;
    }

    static async getById(id) {
        const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(data) {
        const { name, description } = data;
        const id = uuidv4();
        const result = await query(
            'INSERT INTO organizations (id, name, description) VALUES ($1, $2, $3) RETURNING *',
            [id, name, description]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { name, description } = data;
        const result = await query(
            'UPDATE organizations SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getByName(name) {
        const result = await query('SELECT * FROM organizations WHERE name ILIKE $1', [`%${name}%`]);
        return result.rows;
    }
}

module.exports = Organization;
