const express = require('express');
const router = express.Router();
const OrganizationsController = require('../controllers/organizationsController');

// GET /api/organizations - List all organizations
router.get('/', OrganizationsController.getAll);

// GET /api/organizations/:id - Get single organization
router.get('/:id', OrganizationsController.getById);

// POST /api/organizations - Create new organization
router.post('/', OrganizationsController.create);

// PUT /api/organizations/:id - Update organization
router.put('/:id', OrganizationsController.update);

// DELETE /api/organizations/:id - Delete organization
router.delete('/:id', OrganizationsController.delete);

module.exports = router;
