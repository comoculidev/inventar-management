const InventoryItem = require('../models/inventoryItem');

class UserController {
    static async getCurrentUser(req, res) {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            
            // Return user info without password
            const { password_hash, ...userInfo } = user;
            
            res.json({
                success: true,
                data: userInfo
            });
        } catch (error) {
            console.error('Error fetching current user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getMyItems(req, res) {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            
            const { search, status, page = 1, limit = 50 } = req.query;
            
            const items = await InventoryItem.getWithDetails();
            
            // Filter by responsible person
            let myItems = items.filter(item => item.responsible_person === user.username);
            
            // Apply additional filters
            if (search) {
                myItems = myItems.filter(item => 
                    (item.inventory_number && item.inventory_number.toLowerCase().includes(search.toLowerCase())) ||
                    (item.location && item.location.toLowerCase().includes(search.toLowerCase())) ||
                    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
                );
            }
            
            if (status) {
                myItems = myItems.filter(item => item.status === status);
            }
            
            // Apply pagination
            const startIndex = (page - 1) * limit;
            const paginatedItems = myItems.slice(startIndex, startIndex + limit);
            
            res.json({
                success: true,
                data: paginatedItems,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: myItems.length,
                    totalPages: Math.ceil(myItems.length / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching my items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getUserStats(req, res) {
        try {
            const user = req.user;
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized'
                });
            }
            
            const items = await InventoryItem.getWithDetails();
            const myItems = items.filter(item => item.responsible_person === user.username);
            
            const stats = {
                totalItems: myItems.length,
                activeItems: myItems.filter(item => item.status === 'active').length,
                inactiveItems: myItems.filter(item => item.status === 'inactive').length,
                maintenanceItems: myItems.filter(item => item.status === 'maintenance').length,
                lostItems: myItems.filter(item => item.status === 'lost').length
            };
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = UserController;
