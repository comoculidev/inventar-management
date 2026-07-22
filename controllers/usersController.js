const User = require('../models/user');

class UsersController {
    static async getAll(req, res) {
        try {
            const users = await User.getAll();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.getById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async create(req, res) {
        try {
            const { username, password, role = 'user' } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password are required'
                });
            }
            
            // Check if username already exists
            const existingUser = await User.getByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }
            
            const user = await User.create({ username, password, role });
            
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { username, password, role } = req.body;
            
            const user = await User.getById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            // If username is being updated, check for duplicates
            if (username && username !== user.username) {
                const existingUser = await User.getByUsername(username);
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already exists'
                    });
                }
            }
            
            const updatedUser = await User.update(id, { username, password, role });
            
            res.json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const user = await User.getById(id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            await User.delete(id);
            
            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getAdmins(req, res) {
        try {
            const admins = await User.getAdmins();
            res.json({
                success: true,
                data: admins
            });
        } catch (error) {
            console.error('Error fetching admins:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getRegularUsers(req, res) {
        try {
            const users = await User.getUsers();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error fetching regular users:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = UsersController;
