const Building = require('../models/building');
const Organization = require('../models/organization');

class BuildingsController {
    static async getAll(req, res) {
        try {
            const buildings = await Building.getWithOrganization();
            res.json({
                success: true,
                data: buildings
            });
        } catch (error) {
            console.error('Error fetching buildings:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const building = await Building.getById(id);
            
            if (!building) {
                return res.status(404).json({
                    success: false,
                    error: 'Building not found'
                });
            }
            
            res.json({
                success: true,
                data: building
            });
        } catch (error) {
            console.error('Error fetching building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getByOrganization(req, res) {
        try {
            const { organizationId } = req.params;
            const buildings = await Building.getByOrganization(organizationId);
            
            res.json({
                success: true,
                data: buildings
            });
        } catch (error) {
            console.error('Error fetching buildings by organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, description, organization_id } = req.body;
            
            if (!name || !organization_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and organization_id are required'
                });
            }
            
            // Validate organization exists
            const organization = await Organization.getById(organization_id);
            if (!organization) {
                return res.status(400).json({
                    success: false,
                    error: 'Organization not found'
                });
            }
            
            const building = await Building.create({ name, description, organization_id });
            
            res.status(201).json({
                success: true,
                data: building
            });
        } catch (error) {
            console.error('Error creating building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, organization_id } = req.body;
            
            if (!name || !organization_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and organization_id are required'
                });
            }
            
            const building = await Building.getById(id);
            
            if (!building) {
                return res.status(404).json({
                    success: false,
                    error: 'Building not found'
                });
            }
            
            // Validate organization exists
            const organization = await Organization.getById(organization_id);
            if (!organization) {
                return res.status(400).json({
                    success: false,
                    error: 'Organization not found'
                });
            }
            
            const updatedBuilding = await Building.update(id, { name, description, organization_id });
            
            res.json({
                success: true,
                data: updatedBuilding
            });
        } catch (error) {
            console.error('Error updating building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const building = await Building.getById(id);
            
            if (!building) {
                return res.status(404).json({
                    success: false,
                    error: 'Building not found'
                });
            }
            
            await Building.delete(id);
            
            res.json({
                success: true,
                message: 'Building deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting building:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = BuildingsController;
