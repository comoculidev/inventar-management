const express = require('express');
const router = express.Router();
const { InventoryItemsController, upload } = require('../controllers/inventoryItemsController');

// GET /api/inventory-items - List all inventory items
router.get('/', InventoryItemsController.getAll);

// GET /api/inventory-items/:id - Get single inventory item
router.get('/:id', InventoryItemsController.getById);

// GET /api/inventory-items/room/:roomId - Get items by room
router.get('/room/:roomId', InventoryItemsController.getByRoom);

// GET /api/inventory-items/search - Search items
router.get('/search', InventoryItemsController.search);

// GET /api/inventory-items/filter - Filter items
router.get('/filter', InventoryItemsController.filter);

// POST /api/inventory-items - Create new inventory item
router.post('/', InventoryItemsController.create);

// POST /api/inventory-items/bulk - Bulk create inventory items (JSON)
router.post('/bulk', InventoryItemsController.bulkCreate);

// POST /api/inventory-items/import - Import from Excel file
router.post('/import', upload.single('file'), InventoryItemsController.importExcel);

// PUT /api/inventory-items/:id - Update inventory item
router.put('/:id', InventoryItemsController.update);

// DELETE /api/inventory-items/:id - Delete inventory item
router.delete('/:id', InventoryItemsController.delete);

module.exports = router;
