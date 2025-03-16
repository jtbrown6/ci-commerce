const { models, sequelize } = require('../models');
const Joi = require('joi');

// Validation schema for adding item to cart
const addItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  price: Joi.number().precision(2).positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  metadata: Joi.object().allow(null)
});

// Validation schema for updating cart item
const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

// Add item to cart
const addItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    
    // Validate request body
    const { error, value } = addItemSchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart item validation error:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Find the cart
    const cart = await models.Cart.findByPk(cartId);
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found for adding item: ${cartId}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    // Check if cart is active
    if (cart.status !== 'active') {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot add item to cart with status: ${cart.status}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot add item to cart with status: ${cart.status}`
      });
    }
    
    // Check if item with same productId already exists in cart
    const existingItem = await models.CartItem.findOne({
      where: {
        cartId,
        productId: value.productId
      }
    });
    
    let item;
    
    if (existingItem) {
      // Update existing item quantity
      const newQuantity = existingItem.quantity + value.quantity;
      
      item = await existingItem.update({
        quantity: newQuantity
      });
      
      console.log(`[${new Date().toISOString()}] [INFO] Updated existing item in cart ${cartId}: ${item.id}, new quantity: ${newQuantity}`);
    } else {
      // Create new cart item
      item = await models.CartItem.create({
        cartId,
        ...value
      });
      
      console.log(`[${new Date().toISOString()}] [INFO] Added new item to cart ${cartId}: ${item.id}`);
    }
    
    // Get updated cart with all items
    const updatedCart = await models.Cart.findByPk(cartId, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.status(201).json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error adding item to cart:`, error.message);
    res.status(500).json({
      error: 'Failed to add item to cart',
      message: error.message
    });
  }
};

// Update cart item
const updateItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    
    // Validate request body
    const { error, value } = updateItemSchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart item update validation error:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Find the cart item
    const item = await models.CartItem.findOne({
      where: {
        id: itemId,
        cartId
      }
    });
    
    if (!item) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart item not found: ${itemId} in cart ${cartId}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart item not found'
      });
    }
    
    // Find the cart to check status
    const cart = await models.Cart.findByPk(cartId);
    
    if (cart.status !== 'active') {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot update item in cart with status: ${cart.status}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot update item in cart with status: ${cart.status}`
      });
    }
    
    // Update the item
    await item.update({
      quantity: value.quantity
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Updated item ${itemId} in cart ${cartId}: quantity=${value.quantity}`);
    
    // Get updated cart with all items
    const updatedCart = await models.Cart.findByPk(cartId, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error updating cart item:`, error.message);
    res.status(500).json({
      error: 'Failed to update cart item',
      message: error.message
    });
  }
};

// Remove item from cart
const removeItem = async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    
    // Find the cart item
    const item = await models.CartItem.findOne({
      where: {
        id: itemId,
        cartId
      }
    });
    
    if (!item) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart item not found: ${itemId} in cart ${cartId}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart item not found'
      });
    }
    
    // Find the cart to check status
    const cart = await models.Cart.findByPk(cartId);
    
    if (cart.status !== 'active') {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot remove item from cart with status: ${cart.status}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot remove item from cart with status: ${cart.status}`
      });
    }
    
    // Delete the item
    await item.destroy();
    
    console.log(`[${new Date().toISOString()}] [INFO] Removed item ${itemId} from cart ${cartId}`);
    
    // Get updated cart with all items
    const updatedCart = await models.Cart.findByPk(cartId, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error removing cart item:`, error.message);
    res.status(500).json({
      error: 'Failed to remove cart item',
      message: error.message
    });
  }
};

module.exports = {
  addItem,
  updateItem,
  removeItem
};
