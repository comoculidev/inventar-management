const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class InventoryItem {
    static async getAll() {
        const result = await query('SELECT * FROM inventory_items ORDER BY inventory_number ASC');
        return result.rows;
    }

    static async getById(id) {
        const result = await query('SELECT * FROM inventory_items WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getByRoom(roomId) {
        const result = await query(
            'SELECT * FROM inventory_items WHERE room_id = $1 ORDER BY inventory_number ASC',
            [roomId]
        );
        return result.rows;
    }

    static async getByBuilding(buildingId) {
        const result = await query(`
            SELECT ii.* 
            FROM inventory_items ii
            JOIN rooms r ON ii.room_id = r.id
            WHERE r.building_id = $1
            ORDER BY ii.inventory_number ASC
        `, [buildingId]);
        return result.rows;
    }

    static async getByOrganization(organizationId) {
        const result = await query(`
            SELECT ii.* 
            FROM inventory_items ii
            JOIN rooms r ON ii.room_id = r.id
            JOIN buildings b ON r.building_id = b.id
            WHERE b.organization_id = $1
            ORDER BY ii.inventory_number ASC
        `, [organizationId]);
        return result.rows;
    }

    static async create(data) {
        const { inventory_number, location, status, responsible_person, category, room_id } = data;
        const id = uuidv4();
        const result = await query(
            'INSERT INTO inventory_items (id, inventory_number, location, status, responsible_person, category, room_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [id, inventory_number, location, status, responsible_person, category, room_id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { inventory_number, location, status, responsible_person, category, room_id } = data;
        const result = await query(
            'UPDATE inventory_items SET inventory_number = $1, location = $2, status = $3, responsible_person = $4, category = $5, room_id = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [inventory_number, location, status, responsible_person, category, room_id, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query('DELETE FROM inventory_items WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async search(searchTerm) {
        const result = await query(`
            SELECT * FROM inventory_items 
            WHERE inventory_number ILIKE $1 
               OR location ILIKE $1 
               OR status ILIKE $1 
               OR responsible_person ILIKE $1 
               OR category ILIKE $1
            ORDER BY inventory_number ASC
        `, [`%${searchTerm}%`]);
        return result.rows;
    }

    static async filter({ organizationId, buildingId, roomId, category, status, search, page = 1, limit = 20 }) {
        let queryText = `SELECT ii.*, r.name as room_name, b.name as building_name, o.name as organization_name 
            FROM inventory_items ii
            JOIN rooms r ON ii.room_id = r.id
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            WHERE true`;
        const params = [];
        let paramIndex = 1;

        if (roomId) {
            queryText += ` AND ii.room_id = $${paramIndex}`;
            params.push(roomId);
            paramIndex++;
        }

        if (category) {
            queryText += ` AND ii.category ILIKE $${paramIndex}`;
            params.push(`%${category}%`);
            paramIndex++;
        }

        if (status) {
            queryText += ` AND ii.status ILIKE $${paramIndex}`;
            params.push(`%${status}%`);
            paramIndex++;
        }

        if (buildingId) {
            queryText += ` AND r.building_id = $${paramIndex}`;
            params.push(buildingId);
            paramIndex++;
        }

        if (organizationId) {
            queryText += ` AND b.organization_id = $${paramIndex}`;
            params.push(organizationId);
            paramIndex++;
        }

        if (search) {
            queryText += ` AND (ii.inventory_number ILIKE $${paramIndex} OR ii.location ILIKE $${paramIndex} OR ii.status ILIKE $${paramIndex} OR ii.responsible_person ILIKE $${paramIndex} OR ii.category ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        queryText += ` ORDER BY ii.inventory_number ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, (page - 1) * limit);

        const result = await query(queryText, params);
        
        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) FROM inventory_items ii JOIN rooms r ON ii.room_id = r.id JOIN buildings b ON r.building_id = b.id JOIN organizations o ON b.organization_id = o.id WHERE true`;
        const countParams = [];
        let countParamIndex = 1;

        if (roomId) {
            countQuery += ` AND ii.room_id = $${countParamIndex}`;
            countParams.push(roomId);
            countParamIndex++;
        }

        if (category) {
            countQuery += ` AND ii.category ILIKE $${countParamIndex}`;
            countParams.push(`%${category}%`);
            countParamIndex++;
        }

        if (status) {
            countQuery += ` AND ii.status ILIKE $${countParamIndex}`;
            countParams.push(`%${status}%`);
            countParamIndex++;
        }

        if (buildingId) {
            countQuery += ` AND r.building_id = $${countParamIndex}`;
            countParams.push(buildingId);
            countParamIndex++;
        }

        if (organizationId) {
            countQuery += ` AND b.organization_id = $${countParamIndex}`;
            countParams.push(organizationId);
            countParamIndex++;
        }

        if (search) {
            countQuery += ` AND (ii.inventory_number ILIKE $${countParamIndex} OR ii.location ILIKE $${countParamIndex} OR ii.status ILIKE $${countParamIndex} OR ii.responsible_person ILIKE $${countParamIndex} OR ii.category ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count, 10);

        return {
            data: result.rows,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getWithDetails() {
        const result = await query(`
            SELECT ii.*, 
                   r.name as room_name, 
                   b.name as building_name, 
                   o.name as organization_name
            FROM inventory_items ii
            JOIN rooms r ON ii.room_id = r.id
            JOIN buildings b ON r.building_id = b.id
            JOIN organizations o ON b.organization_id = o.id
            ORDER BY o.name, b.name, r.name, ii.inventory_number
        `);
        return result.rows;
    }

    static async bulkCreate(items) {
        const client = await require('../config/db').getClient();
        try {
            await client.query('BEGIN');
            
            const results = [];
            for (const item of items) {
                const id = uuidv4();
                const result = await client.query(
                    'INSERT INTO inventory_items (id, inventory_number, location, status, responsible_person, category, room_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                    [id, item.inventory_number, item.location, item.status, item.responsible_person, item.category, item.room_id]
                );
                results.push(result.rows[0]);
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = InventoryItem;
