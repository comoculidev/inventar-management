const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
    static async getAll() {
        const result = await query('SELECT id, username, role, created_at, updated_at FROM users ORDER BY username ASC');
        return result.rows;
    }

    static async getById(id) {
        const result = await query('SELECT id, username, role, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByUsername(username) {
        const result = await query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    }

    static async create(data) {
        const { username, password, role = 'user' } = data;
        const id = uuidv4();
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        const result = await query(
            'INSERT INTO users (id, username, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role, created_at, updated_at',
            [id, username, password_hash, role]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { username, password, role } = data;
        
        let password_hash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            password_hash = await bcrypt.hash(password, salt);
        }
        
        const result = await query(
            `UPDATE users SET 
                username = COALESCE($1, username),
                password_hash = COALESCE($2, password_hash),
                role = COALESCE($3, role),
                updated_at = NOW()
            WHERE id = $4 
            RETURNING id, username, role, created_at, updated_at`,
            [username, password_hash, role, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, username, role', [id]);
        return result.rows[0];
    }

    static async getAdmins() {
        const result = await query('SELECT id, username, role, created_at, updated_at FROM users WHERE role = $1 ORDER BY username ASC', ['admin']);
        return result.rows;
    }

    static async getUsers() {
        const result = await query('SELECT id, username, role, created_at, updated_at FROM users WHERE role = $1 ORDER BY username ASC', ['user']);
        return result.rows;
    }

    static async comparePassword(userId, password) {
        const user = await User.getById(userId);
        if (!user) return false;
        
        const fullUser = await User.getByUsername(user.username);
        if (!fullUser) return false;
        
        return await bcrypt.compare(password, fullUser.password_hash);
    }
}

module.exports = User;
