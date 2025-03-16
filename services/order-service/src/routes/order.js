const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');

// GET /orders - Get all orders with filtering and pagination
router.get('/', orderController.getOrders);

// GET /orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// POST /orders - Create new order
router.post('/', orderController.createOrder);

// PUT /orders/:id - Update order
router.put('/:id', orderController.updateOrder);

// POST /orders/:id/cancel - Cancel order
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
