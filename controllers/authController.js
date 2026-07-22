const User = require('../models/user');
const jwt = require('jsonwebtoken');
const HistoryLog = require('../models/historyLog');

class AuthController {
    static async register(req, res) {
        try {
            const { username, password, role = 'user' } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password are required'
                });
            }
            
            // Validate username format (alphanumeric and underscores only)
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                return res.status(400).json({
                    success: false,
                    error: 'Username can only contain letters, numbers, and underscores'
                });
            }
            
            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 6 characters long'
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
            
            // Log user creation
            await HistoryLog.create({
                action_type: 'create',
                responsible_person: username,
                new_values: { username, role }
            });
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: user
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password are required'
                });
            }
            
            // Find user
            const user = await User.getByUsername(username);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
            
            // Compare passwords
            const isMatch = await require('bcryptjs').compare(password, user.password_hash);
            
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }
            
            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your_jwt_secret_key_here',
                { expiresIn: '7d' }
            );
            
            // Set cookie with 7-day expiration
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 604800000, // 7 days in milliseconds
                path: '/'
            });
            
            // Log login
            await HistoryLog.create({
                action_type: 'login',
                responsible_person: username
            });
            
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    },
                    redirect: user.role === 'admin' ? '/admin-dashboard' : '/user-panel'
                }
            });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async logout(req, res) {
        try {
            // Clear token cookie
            res.clearCookie('token', { path: '/' });
            
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }

    static async getMe(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            
            res.json({
                success: true,
                data: req.user
            });
        } catch (error) {
            console.error('Error fetching current user:', error);
            res.status(500).json({
                success: false,
                error: 'Server error'
            });
        }
    }
}

module.exports = AuthController;
