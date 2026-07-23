const InventoryItem = require('../models/inventoryItem');
const Room = require('../models/room');
const Building = require('../models/building');
const Organization = require('../models/organization');
const multer = require('multer');
const xlsx = require('xlsx');
const { parseExcelBuffer, validateItems, resolveRoomId } = require('../utils/excelImport');
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
            const { organizationId, buildingId, category, status, search, page = 1, limit = 20 } = req.query;
            
            const items = await InventoryItem.filter({
                organizationId,
                buildingId,
                category,
                status,
                search,
                page,
                limit
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
            const invalidItems = [];
            const user = req.user || { id: 'system', username: 'system' };
            
            for (const itemData of validItems) {
                // Try to resolve room_id if not provided or if we have name-based lookup
                let resolvedRoomId = itemData.room_id;
                
                // If room_id is not provided but we have room_name, try to resolve it
                if (!resolvedRoomId && itemData.room_name) {
                    // Try to find room by name
                    const allRooms = await Room.getAll();
                    const roomByName = allRooms.find(r => r.name === itemData.room_name);
                    if (roomByName) {
                        resolvedRoomId = roomByName.id;
                    } else if (itemData.organization_name && itemData.building_name) {
                        // Try to find by organization and building
                        const orgs = await Organization.getByName(itemData.organization_name);
                        if (orgs && orgs.length > 0) {
                            const buildings = await Building.getByOrganization(orgs[0].id);
                            const building = buildings.find(b => b.name === itemData.building_name);
                            if (building) {
                                const rooms = await Room.getByBuilding(building.id);
                                const room = rooms.find(r => r.name === itemData.room_name);
                                if (room) {
                                    resolvedRoomId = room.id;
                                }
                            }
                        }
                    }
                }
                
                if (!resolvedRoomId) {
                    invalidItems.push({
                        ...itemData,
                        error: 'Could not resolve room ID from provided data'
                    });
                    continue;
                }
                
                // Validate room exists
                const room = await Room.getById(resolvedRoomId);
                if (!room) {
                    invalidItems.push({
                        ...itemData,
                        error: `Room with ID ${resolvedRoomId} not found`
                    });
                    continue;
                }
                
                const item = await InventoryItem.create({
                    inventory_number: itemData.inventory_number,
                    location: itemData.location,
                    status: itemData.status,
                    responsible_person: itemData.responsible_person,
                    category: itemData.category,
                    room_id: resolvedRoomId
                });
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
                invalidItems,
                message: invalidItems.length > 0 
                    ? `${createdItems.length} items imported, ${invalidItems.length} failed`
                    : `${createdItems.length} items imported successfully`
            });
        } catch (error) {
            console.error('Error importing Excel file:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    // Export items to Excel
    static async exportExcel(req, res) {
        try {
            const { organizationId, buildingId, roomId, category, status } = req.query;
            
            let items;
            
            // Get items based on filters
            if (roomId) {
                items = await InventoryItem.getByRoom(roomId);
            } else if (organizationId || buildingId || category || status) {
                const result = await InventoryItem.filter({
                    organizationId,
                    buildingId,
                    category,
                    status
                });
                items = result.data || result;
            } else {
                items = await InventoryItem.getWithDetails();
            }
            
            // Prepare data for Excel
            const excelData = items.map(item => ({
                'İnventar Nömrəsi': item.inventory_number || '',
                'Yerləşdə': item.location || '',
                'Status': item.status || '',
                'Kateqoriya': item.category || '',
                'Məsul Şəxs': item.responsible_person || '',
                'Otaq': item.room_name || '',
                'Bina': item.building_name || '',
                'Təşkilat': item.organization_name || ''
            }));
            
            // Create worksheet
            const ws = xlsx.utils.json_to_sheet(excelData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, 'İnventar');
            
            // Set response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=inventar_elementleri.xlsx');
            
            // Send the file
            const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.send(buffer);
            
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = { InventoryItemsController, upload };
