// Role-Based Access Control Middleware

const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    
    next();
};

const verifyUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            error: 'User access required'
        });
    }
    
    next();
};

const verifyAdminOrUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }
    
    next();
};

// Middleware to protect admin routes
const protectAdminRoutes = (req, res, next) => {
    // Check if the route starts with /admin
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required for admin routes'
            });
        }
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
    }
    
    next();
};

// Middleware to protect user routes
const protectUserRoutes = (req, res, next) => {
    // Check if the route starts with /user
    if (req.path.startsWith('/user') || req.path.startsWith('/api/user')) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required for user routes'
            });
        }
        
        if (req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                error: 'User access required'
            });
        }
    }
    
    next();
};

module.exports = {
    verifyAdmin,
    verifyUser,
    verifyAdminOrUser,
    protectAdminRoutes,
    protectUserRoutes
};
