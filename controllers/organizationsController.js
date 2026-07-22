const Organization = require('../models/organization');

class OrganizationsController {
    static async getAll(req, res) {
        try {
            const organizations = await Organization.getAll();
            res.json({
                success: true,
                data: organizations
            });
        } catch (error) {
            console.error('Error fetching organizations:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const organization = await Organization.getById(id);
            
            if (!organization) {
                return res.status(404).json({
                    success: false,
                    error: 'Organization not found'
                });
            }
            
            res.json({
                success: true,
                data: organization
            });
        } catch (error) {
            console.error('Error fetching organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Name is required'
                });
            }
            
            const organization = await Organization.create({ name, description });
            
            res.status(201).json({
                success: true,
                data: organization
            });
        } catch (error) {
            console.error('Error creating organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Name is required'
                });
            }
            
            const organization = await Organization.getById(id);
            
            if (!organization) {
                return res.status(404).json({
                    success: false,
                    error: 'Organization not found'
                });
            }
            
            const updatedOrganization = await Organization.update(id, { name, description });
            
            res.json({
                success: true,
                data: updatedOrganization
            });
        } catch (error) {
            console.error('Error updating organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const organization = await Organization.getById(id);
            
            if (!organization) {
                return res.status(404).json({
                    success: false,
                    error: 'Organization not found'
                });
            }
            
            await Organization.delete(id);
            
            res.json({
                success: true,
                message: 'Organization deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting organization:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = OrganizationsController;
