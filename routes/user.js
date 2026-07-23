const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyUser } = require('../middleware/roleMiddleware');

// GET /api/user/me - Get current user info
router.get('/me', verifyUser, UserController.getCurrentUser);

// GET /api/user/my-items - Get items assigned to current user
router.get('/my-items', verifyUser, UserController.getMyItems);

// GET /api/user/stats - Get user-specific statistics
router.get('/stats', verifyUser, UserController.getUserStats);

module.exports = router;
