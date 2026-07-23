const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Verify authentication middleware
const verifyAuth = async (req, res, next) => {
    try {
        // Check for token in cookies
        const token = req.cookies.token;
        
        if (!token) {
            // If the request accepts HTML, redirect to login
            if (req.accepts('html')) {
                return res.redirect('/login');
            }
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        
        // Check if user exists
        const user = await User.getById(decoded.userId);
        
        if (!user) {
            // If the request accepts HTML, redirect to login
            if (req.accepts('html')) {
                return res.redirect('/login');
            }
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Attach user to request
        req.user = user;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        // If the request accepts HTML, redirect to login
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// Verify role middleware
const verifyRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            // If the request accepts HTML, redirect to login
            if (req.accepts('html')) {
                return res.redirect('/login');
            }
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        if (roles.length && !roles.includes(req.user.role)) {
            // If the request accepts HTML, redirect to appropriate dashboard
            if (req.accepts('html')) {
                if (req.user.role === 'admin') {
                    return res.redirect('/admin/dashboard');
                } else {
                    return res.redirect('/user-panel');
                }
            }
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions'
            });
        }
        
        next();
    };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        // If the request accepts HTML, redirect to login
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'admin') {
        // If the request accepts HTML, redirect to user panel
        if (req.accepts('html')) {
            return res.redirect('/user-panel');
        }
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    next();
};

// Check if user is regular user (not admin)
const isUser = (req, res, next) => {
    if (!req.user) {
        // If the request accepts HTML, redirect to login
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'user') {
        // If the request accepts HTML, redirect to admin dashboard
        if (req.accepts('html')) {
            return res.redirect('/admin/dashboard');
        }
        return res.status(403).json({
            success: false,
            error: 'User access required'
        });
    }
    
    next();
};

module.exports = {
    verifyAuth,
    verifyRole,
    isAdmin,
    isUser
};
