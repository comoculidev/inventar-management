const InventoryItem = require('../models/inventoryItem');
const Room = require('../models/room');
const multer = require('multer');
const { parseExcelBuffer, validateItems } = require('../utils/excelImport');
const HistoryLog = require('../models/historyLog');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
            
            // Log creation
            await HistoryLog.create({
                action_type: 'create',
                room_id: room_id,
                responsible_person,
                new_values: { inventory_number, location, status, category }
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
            
            // Get old values for history
            const oldValues = {
                inventory_number: item.inventory_number,
                location: item.location,
                status: item.status,
                responsible_person: item.responsible_person,
                category: item.category,
                room_id: item.room_id
            };
            
            const updatedItem = await InventoryItem.update(id, {
                inventory_number,
                location,
                status,
                responsible_person,
                category,
                room_id
            });
            
            // Log update
            await HistoryLog.create({
                action_type: 'update',
                room_id: room_id,
                responsible_person,
                old_values: oldValues,
                new_values: { inventory_number, location, status, category, room_id }
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
            
            // Log deletion
            await HistoryLog.create({
                action_type: 'delete',
                room_id: item.room_id,
                responsible_person: item.responsible_person,
                old_values: {
                    inventory_number: item.inventory_number,
                    location: item.location,
                    status: item.status,
                    category: item.category
                }
            });
            
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
            const { organizationId, buildingId, roomId, category, status, search, page = 1, limit = 20 } = req.query;
            
            const result = await InventoryItem.filter({
                organizationId,
                buildingId,
                roomId,
                category,
                status,
                search,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            });
            
            res.json({
                success: true,
                ...result
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
            
            // Log bulk creation
            await HistoryLog.create({
                action_type: 'import',
                responsible_person: req.user?.username || 'system',
                new_values: { count: createdItems.length }
            });
            
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

    // Import from Excel file
    static async importExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            
            // Parse Excel file
            const items = parseExcelBuffer(req.file.buffer);
            
            if (items.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid items found in the Excel file'
                });
            }
            
            // Validate items
            const { validItems, invalidItems } = validateItems(items);
            
            if (validItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid items to import',
                    invalidItems
                });
            }
            
            // Import valid items
            const createdItems = await InventoryItem.bulkCreate(validItems);
            
            // Log import
            await HistoryLog.create({
                action_type: 'import',
                responsible_person: req.user?.username || 'system',
                new_values: {
                    total: items.length,
                    valid: validItems.length,
                    invalid: invalidItems.length
                }
            });
            
            res.status(201).json({
                success: true,
                data: createdItems,
                message: `${createdItems.length} items imported successfully`,
                invalidItems: invalidItems.length > 0 ? invalidItems : undefined
            });
        } catch (error) {
            console.error('Error importing Excel file:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = { InventoryItemsController, upload };
