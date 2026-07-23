require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const { runMigrations } = require('./utils/migrationRunner');
const { verifyAuth } = require('./middleware/authMiddleware');
const { verifyAdmin } = require('./middleware/roleMiddleware');

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

// Admin Routes (protected)
app.get('/admin/dashboard', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/inventory', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'inventory.html'));
});

app.get('/admin/rooms', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'rooms.html'));
});

// Room detail route - matches /organization/building/room/:id
app.get('/organization/building/room/:id', verifyAuth, verifyAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'room-detail.html'));
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

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;
