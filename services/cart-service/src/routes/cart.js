const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const cartItemController = require('../controllers/cartItem');

// Cart routes
// GET /carts/:id - Get cart by ID
router.get('/:id', cartController.getCartById);

// GET /carts/user/:userId - Get active cart for user
router.get('/user/:userId', cartController.getCartByUserId);

// POST /carts - Create new cart
router.post('/', cartController.createCart);

// DELETE /carts/:id - Delete cart
router.delete('/:id', cartController.deleteCart);

// POST /carts/:id/clear - Clear cart (remove all items)
router.post('/:id/clear', cartController.clearCart);

// POST /carts/:id/abandon - Mark cart as abandoned
router.post('/:id/abandon', cartController.abandonCart);

// POST /carts/:id/convert - Mark cart as converted to order
router.post('/:id/convert', cartController.convertCart);

// Cart item routes
// POST /carts/:cartId/items - Add item to cart
router.post('/:cartId/items', cartItemController.addItem);

// PUT /carts/:cartId/items/:itemId - Update cart item
router.put('/:cartId/items/:itemId', cartItemController.updateItem);

// DELETE /carts/:cartId/items/:itemId - Remove item from cart
router.delete('/:cartId/items/:itemId', cartItemController.removeItem);

module.exports = router;
