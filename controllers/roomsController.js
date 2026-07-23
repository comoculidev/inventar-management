const Room = require('../models/room');
const Building = require('../models/building');
const InventoryItem = require('../models/inventoryItem');

class RoomsController {
    static async getAll(req, res) {
        try {
            const { search, organizationId, buildingId, page = 1, limit = 100 } = req.query;
            
            const options = {
                search,
                organizationId,
                buildingId,
                page: parseInt(page),
                limit: parseInt(limit)
            };
            
            const rooms = await Room.getFiltered(options);
            const total = await Room.countFiltered(options);
            
            res.json({
                success: true,
                data: rooms,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching rooms:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const room = await Room.getByIdWithDetails(id);
            
            if (!room) {
                return res.status(404).json({
                    success: false,
                    error: 'Room not found'
                });
            }
            
            res.json({
                success: true,
                data: room
            });
        } catch (error) {
            console.error('Error fetching room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getItemsByRoom(req, res) {
        try {
            const { id } = req.params;
            const { search, status, category } = req.query;
            
            let items = await InventoryItem.getByRoom(id);
            
            // Apply filters if provided
            if (search) {
                items = items.filter(item => 
                    (item.inventory_number && item.inventory_number.toLowerCase().includes(search.toLowerCase())) ||
                    (item.location && item.location.toLowerCase().includes(search.toLowerCase())) ||
                    (item.responsible_person && item.responsible_person.toLowerCase().includes(search.toLowerCase())) ||
                    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
                );
            }
            
            if (status) {
                items = items.filter(item => item.status === status);
            }
            
            if (category) {
                items = items.filter(item => item.category === category);
            }
            
            res.json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error fetching items by room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByBuilding(req, res) {
        try {
            const { buildingId } = req.params;
            const rooms = await Room.getByBuilding(buildingId);
            
            res.json({
                success: true,
                data: rooms
            });
        } catch (error) {
            console.error('Error fetching rooms by building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByOrganization(req, res) {
        try {
            const { organizationId } = req.params;
            const rooms = await Room.getByOrganization(organizationId);
            
            res.json({
                success: true,
                data: rooms
            });
        } catch (error) {
            console.error('Error fetching rooms by organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, description, capacity, building_id } = req.body;
            
            if (!name || !building_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and building_id are required'
                });
            }
            
            // Validate building exists
            const building = await Building.getById(building_id);
            if (!building) {
                return res.status(400).json({
                    success: false,
                    error: 'Building not found'
                });
            }
            
            const room = await Room.create({ name, description, capacity, building_id });
            
            res.status(201).json({
                success: true,
                data: room
            });
        } catch (error) {
            console.error('Error creating room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, capacity, building_id } = req.body;
            
            if (!name || !building_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and building_id are required'
                });
            }
            
            const room = await Room.getById(id);
            
            if (!room) {
                return res.status(404).json({
                    success: false,
                    error: 'Room not found'
                });
            }
            
            // Validate building exists
            const building = await Building.getById(building_id);
            if (!building) {
                return res.status(400).json({
                    success: false,
                    error: 'Building not found'
                });
            }
            
            const updatedRoom = await Room.update(id, { name, description, capacity, building_id });
            
            res.json({
                success: true,
                data: updatedRoom
            });
        } catch (error) {
            console.error('Error updating room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const room = await Room.getById(id);
            
            if (!room) {
                return res.status(404).json({
                    success: false,
                    error: 'Room not found'
                });
            }
            
            await Room.delete(id);
            
            res.json({
                success: true,
                message: 'Room deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting room:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = RoomsController;
