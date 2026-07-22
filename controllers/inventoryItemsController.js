const InventoryItem = require('../models/inventoryItem');
const Room = require('../models/room');

class InventoryItemsController {
    static async getAll(req, res) {
        try {
            const items = await InventoryItem.getWithDetails();
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const item = await InventoryItem.getById(id);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            
            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Error fetching inventory item:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByRoom(req, res) {
        try {
            const { roomId } = req.params;
            const items = await InventoryItem.getByRoom(roomId);
            
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error fetching inventory items by room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const { inventory_number, location, status, responsible_person, category, room_id } = req.body;
            
            if (!inventory_number || !room_id) {
                return res.status(400).json({
                    success: false,
                    error: 'inventory_number and room_id are required'
                });
            }
            
            // Validate room exists
            const room = await Room.getById(room_id);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    error: 'Room not found'
                });
            }
            
            const item = await InventoryItem.create({
                inventory_number,
                location,
                status,
                responsible_person,
                category,
                room_id
            });
            
            res.status(201).json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Error creating inventory item:', error);
            if (error.message.includes('duplicate key value violates unique constraint')) {
                return res.status(400).json({
                    success: false,
                    error: 'Inventory number already exists'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { inventory_number, location, status, responsible_person, category, room_id } = req.body;
            
            if (!inventory_number || !room_id) {
                return res.status(400).json({
                    success: false,
                    error: 'inventory_number and room_id are required'
                });
            }
            
            const item = await InventoryItem.getById(id);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            
            // Validate room exists
            const room = await Room.getById(room_id);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    error: 'Room not found'
                });
            }
            
            const updatedItem = await InventoryItem.update(id, {
                inventory_number,
                location,
                status,
                responsible_person,
                category,
                room_id
            });
            
            res.json({
                success: true,
                data: updatedItem
            });
        } catch (error) {
            console.error('Error updating inventory item:', error);
            if (error.message.includes('duplicate key value violates unique constraint')) {
                return res.status(400).json({
                    success: false,
                    error: 'Inventory number already exists'
                });
            }
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const item = await InventoryItem.getById(id);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            
            await InventoryItem.delete(id);
            
            res.json({
                success: true,
                message: 'Inventory item deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async search(req, res) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    error: 'Search term is required'
                });
            }
            
            const items = await InventoryItem.search(searchTerm);
            
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error searching inventory items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async filter(req, res) {
        try {
            const { organizationId, buildingId, roomId, category, status } = req.query;
            
            const items = await InventoryItem.filter({
                organizationId,
                buildingId,
                roomId,
                category,
                status
            });
            
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error filtering inventory items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async bulkCreate(req, res) {
        try {
            const items = req.body;
            
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Items array is required'
                });
            }
            
            // Validate all items have required fields
            for (const item of items) {
                if (!item.inventory_number || !item.room_id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Each item must have inventory_number and room_id'
                    });
                }
            }
            
            const createdItems = await InventoryItem.bulkCreate(items);
            
            res.status(201).json({
                success: true,
                data: createdItems,
                message: `${createdItems.length} items created successfully`
            });
        } catch (error) {
            console.error('Error bulk creating inventory items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = InventoryItemsController;
