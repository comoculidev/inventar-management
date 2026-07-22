const { query } = require('../config/db');

class DashboardController {
    static async getStats(req, res) {
        try {
            // Get all counts in parallel
            const [
                organizationsCount,
                buildingsCount,
                roomsCount,
                itemsCount,
                usersCount,
                adminsCount
            ] = await Promise.all([
                query('SELECT COUNT(*) FROM organizations'),
                query('SELECT COUNT(*) FROM buildings'),
                query('SELECT COUNT(*) FROM rooms'),
                query('SELECT COUNT(*) FROM inventory_items'),
                query('SELECT COUNT(*) FROM users'),
                query("SELECT COUNT(*) FROM users WHERE role = 'admin'")
            ]);
            
            res.json({
                success: true,
                data: {
                    totalOrganizations: parseInt(organizationsCount.rows[0].count, 10),
                    totalBuildings: parseInt(buildingsCount.rows[0].count, 10),
                    totalRooms: parseInt(roomsCount.rows[0].count, 10),
                    totalItems: parseInt(itemsCount.rows[0].count, 10),
                    totalUsers: parseInt(usersCount.rows[0].count, 10),
                    totalAdmins: parseInt(adminsCount.rows[0].count, 10)
                }
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getDetailedStats(req, res) {
        try {
            // Get counts by organization
            const orgStats = await query(`
                SELECT 
                    o.id,
                    o.name as organization_name,
                    COUNT(DISTINCT b.id) as building_count,
                    COUNT(DISTINCT r.id) as room_count,
                    COUNT(DISTINCT ii.id) as item_count
                FROM organizations o
                LEFT JOIN buildings b ON o.id = b.organization_id
                LEFT JOIN rooms r ON b.id = r.building_id
                LEFT JOIN inventory_items ii ON r.id = ii.room_id
                GROUP BY o.id, o.name
                ORDER BY o.name
            `);
            
            // Get counts by category
            const categoryStats = await query(`
                SELECT 
                    category,
                    COUNT(*) as count
                FROM inventory_items
                WHERE category IS NOT NULL
                GROUP BY category
                ORDER BY count DESC
            `);
            
            // Get counts by status
            const statusStats = await query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM inventory_items
                GROUP BY status
                ORDER BY count DESC
            `);
            
            // Get recent history
            const recentHistory = await query(`
                SELECT hl.*, 
                       o.name as organization_name,
                       b.name as building_name,
                       r.name as room_name
                FROM history_logs hl
                LEFT JOIN organizations o ON hl.organization_id = o.id
                LEFT JOIN buildings b ON hl.building_id = b.id
                LEFT JOIN rooms r ON hl.room_id = r.id
                ORDER BY hl.created_at DESC
                LIMIT 10
            `);
            
            res.json({
                success: true,
                data: {
                    byOrganization: orgStats.rows,
                    byCategory: categoryStats.rows,
                    byStatus: statusStats.rows,
                    recentHistory: recentHistory.rows
                }
            });
        } catch (error) {
            console.error('Error fetching detailed dashboard stats:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = DashboardController;
