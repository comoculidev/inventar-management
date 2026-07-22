const express = require('express');
const router = express.Router();
const RoomsController = require('../controllers/roomsController');

// GET /api/rooms - List all rooms
router.get('/', RoomsController.getAll);

// GET /api/rooms/:id - Get single room
router.get('/:id', RoomsController.getById);

// GET /api/rooms/building/:buildingId - Get rooms by building
router.get('/building/:buildingId', RoomsController.getByBuilding);

// GET /api/rooms/organization/:organizationId - Get rooms by organization
router.get('/organization/:organizationId', RoomsController.getByOrganization);

// POST /api/rooms - Create new room
router.post('/', RoomsController.create);

// PUT /api/rooms/:id - Update room
router.put('/:id', RoomsController.update);

// DELETE /api/rooms/:id - Delete room
router.delete('/:id', RoomsController.delete);

module.exports = router;
