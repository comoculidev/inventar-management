require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const { runMigrations } = require('./utils/migrationRunner');
const { verifyAuth } = require('./middleware/authMiddleware');
const { verifyAdmin, verifyUser } = require('./middleware/roleMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Run migrations on startup (in development)
if (process.env.NODE_ENV !== 'test') {
    runMigrations().catch(err => {
        console.error('Migration failed:', err);
        process.exit(1);
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// View engine setup (using HTML files)
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Login Route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Home route - redirect to login if not authenticated, otherwise redirect based on role
app.get('/', (req, res) => {
    // Check if user is authenticated by checking for token cookie
    if (req.cookies.token) {
        // Try to verify the token
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
            // Redirect based on role
            if (decoded.role === 'admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/user-panel');
            }
        } catch (error) {
            // Token is invalid or expired, redirect to login
            return res.redirect('/login');
        }
    }
    // Not authenticated, redirect to login
    res.redirect('/login');
});

// Admin Routes (protected)
app.get('/admin/dashboard', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/organizations', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'organizations.html'));
});

app.get('/admin/buildings', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'buildings.html'));
});

app.get('/admin/rooms', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'rooms.html'));
});

app.get('/admin/inventory', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'inventory.html'));
});

app.get('/admin/users', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'users.html'));
});

app.get('/admin/history', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'history.html'));
});

// Room detail route - matches /organization/building/room/:id
app.get('/organization/building/room/:id', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'room-detail.html'));
});

// User Panel Routes (protected, non-admin only)
app.get('/user-panel', verifyAuth, verifyUser, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user-panel.html'));
});

app.get('/user-panel/my-items', verifyAuth, verifyUser, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user-my-items.html'));
});

app.get('/user-panel/profile', verifyAuth, verifyUser, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'user-profile.html'));
});

// API Routes
app.use('/api/organizations', verifyAuth, require('./routes/organizations'));
app.use('/api/buildings', verifyAuth, require('./routes/buildings'));
app.use('/api/rooms', verifyAuth, require('./routes/rooms'));
app.use('/api/inventory-items', verifyAuth, require('./routes/inventoryItems'));
app.use('/api/users', verifyAuth, verifyAdmin, require('./routes/users'));
app.use('/api/history', verifyAuth, require('./routes/historyLogs'));
app.use('/api/dashboard', verifyAuth, require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', verifyAuth, verifyUser, require('./routes/user'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});

// 404 handler - redirect to login for HTML requests
app.use((req, res, next) => {
    // If the request accepts HTML and is not an API request, redirect to login
    if (req.accepts('html') && !req.path.startsWith('/api/') && !req.path.startsWith('/css/') && !req.path.startsWith('/js/') && !req.path.startsWith('/images/')) {
        return res.redirect('/login');
    }
    res.status(404).json({
        success: false,
        error: 'Not Found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
    console.log(`Login page: http://localhost:${PORT}/login`);
});

module.exports = app;
