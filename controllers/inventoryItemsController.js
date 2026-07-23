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
            const { roomId } = req.query;
            
            let items;
            if (roomId) {
                items = await InventoryItem.getByRoom(roomId);
            } else {
                items = await InventoryItem.getWithDetails();
            }
            
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
            const user = req.user || { id: 'system', username: 'system' };
            await HistoryLog.create({
                action_type: 'create',
                table_name: 'inventory_items',
                record_id: item.id,
                old_values: null,
                new_values: JSON.stringify(item),
                user_id: user.id,
                user_name: user.username
            });
            
            res.status(201).json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Error creating inventory item:', error);
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
            
            const oldValues = JSON.stringify(item);
            const updatedItem = await InventoryItem.update(id, {
                inventory_number,
                location,
                status,
                responsible_person,
                category,
                room_id
            });
            
            // Log update
            const user = req.user || { id: 'system', username: 'system' };
            await HistoryLog.create({
                action_type: 'update',
                table_name: 'inventory_items',
                record_id: id,
                old_values: oldValues,
                new_values: JSON.stringify(updatedItem),
                user_id: user.id,
                user_name: user.username
            });
            
            res.json({
                success: true,
                data: updatedItem
            });
        } catch (error) {
            console.error('Error updating inventory item:', error);
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
            const user = req.user || { id: 'system', username: 'system' };
            await HistoryLog.create({
                action_type: 'delete',
                table_name: 'inventory_items',
                record_id: id,
                old_values: JSON.stringify(item),
                new_values: null,
                user_id: user.id,
                user_name: user.username
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
            const { q } = req.query;
            const items = await InventoryItem.search(q);
            
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
            const { organizationId, buildingId, category, status } = req.query;
            
            const items = await InventoryItem.filter({
                organizationId,
                buildingId,
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
            
            const createdItems = [];
            const user = req.user || { id: 'system', username: 'system' };
            
            for (const itemData of items) {
                // Validate room exists
                const room = await Room.getById(itemData.room_id);
                if (!room) {
                    console.warn(`Room not found for item: ${itemData.inventory_number}`);
                    continue;
                }
                
                const item = await InventoryItem.create(itemData);
                createdItems.push(item);
                
                // Log creation
                await HistoryLog.create({
                    action_type: 'create',
                    table_name: 'inventory_items',
                    record_id: item.id,
                    old_values: null,
                    new_values: JSON.stringify(item),
                    user_id: user.id,
                    user_name: user.username
                });
            }
            
            res.status(201).json({
                success: true,
                data: createdItems,
                count: createdItems.length
            });
        } catch (error) {
            console.error('Error bulk creating inventory items:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async importExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            
            const items = await parseExcelBuffer(req.file.buffer);
            const { validItems, errors } = validateItems(items);
            
            if (validItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid items found in the file',
                    errors
                });
            }
            
            const createdItems = [];
            const user = req.user || { id: 'system', username: 'system' };
            
            for (const itemData of validItems) {
                // Validate room exists
                const room = await Room.getById(itemData.room_id);
                if (!room) {
                    console.warn(`Room not found for item: ${itemData.inventory_number}`);
                    continue;
                }
                
                const item = await InventoryItem.create(itemData);
                createdItems.push(item);
                
                // Log creation
                await HistoryLog.create({
                    action_type: 'create',
                    table_name: 'inventory_items',
                    record_id: item.id,
                    old_values: null,
                    new_values: JSON.stringify(item),
                    user_id: user.id,
                    user_name: user.username
                });
            }
            
            res.status(201).json({
                success: true,
                data: createdItems,
                count: createdItems.length,
                errors
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
