const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/usersController');

// GET /api/users - List all users
router.get('/', UsersController.getAll);

// GET /api/users/admins - List all admin users
router.get('/admins', UsersController.getAdmins);

// GET /api/users/regular - List all regular users
router.get('/regular', UsersController.getRegularUsers);

// GET /api/users/:id - Get single user
router.get('/:id', UsersController.getById);

// POST /api/users - Create new user
router.post('/', UsersController.create);

// PUT /api/users/:id - Update user
router.put('/:id', UsersController.update);

// DELETE /api/users/:id - Delete user
router.delete('/:id', UsersController.delete);

module.exports = router;
