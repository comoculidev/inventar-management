const express = require('express');
const router = express.Router();
const BuildingsController = require('../controllers/buildingsController');

// GET /api/buildings - List all buildings
router.get('/', BuildingsController.getAll);

// GET /api/buildings/:id - Get single building
router.get('/:id', BuildingsController.getById);

// GET /api/buildings/organization/:organizationId - Get buildings by organization
router.get('/organization/:organizationId', BuildingsController.getByOrganization);

// POST /api/buildings - Create new building
router.post('/', BuildingsController.create);

// PUT /api/buildings/:id - Update building
router.put('/:id', BuildingsController.update);

// DELETE /api/buildings/:id - Delete building
router.delete('/:id', BuildingsController.delete);

module.exports = router;
