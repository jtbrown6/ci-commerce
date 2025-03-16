const { models, sequelize } = require('../models');
const Joi = require('joi');

// Validation schema for creating a cart
const createCartSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  metadata: Joi.object().allow(null)
});

// Get cart by ID
const getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cart = await models.Cart.findByPk(id, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved cart: ${cart.id} for user ${cart.userId}`);
    
    res.json(cart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error retrieving cart:`, error.message);
    res.status(500).json({
      error: 'Failed to retrieve cart',
      message: error.message
    });
  }
};

// Get active cart for user
const getCartByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find active cart for user
    let cart = await models.Cart.findOne({
      where: {
        userId,
        status: 'active'
      },
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    // If no active cart, create one
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [INFO] No active cart found for user ${userId}, creating new cart`);
      
      cart = await models.Cart.create({
        userId,
        status: 'active'
      });
      
      // Reload with items (should be empty)
      cart = await models.Cart.findByPk(cart.id, {
        include: [{ model: models.CartItem, as: 'items' }]
      });
    }
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved active cart for user ${userId}: ${cart.id}`);
    
    res.json(cart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error retrieving user cart:`, error.message);
    res.status(500).json({
      error: 'Failed to retrieve user cart',
      message: error.message
    });
  }
};

// Create new cart
const createCart = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createCartSchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart validation error:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Check if user already has an active cart
    const existingCart = await models.Cart.findOne({
      where: {
        userId: value.userId,
        status: 'active'
      }
    });
    
    if (existingCart) {
      console.log(`[${new Date().toISOString()}] [WARN] User ${value.userId} already has an active cart: ${existingCart.id}`);
      return res.status(409).json({
        error: 'Cart exists',
        message: 'User already has an active cart',
        cartId: existingCart.id
      });
    }
    
    // Create new cart
    const cart = await models.Cart.create(value);
    
    console.log(`[${new Date().toISOString()}] [INFO] Created new cart: ${cart.id} for user ${cart.userId}`);
    
    res.status(201).json(cart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error creating cart:`, error.message);
    res.status(500).json({
      error: 'Failed to create cart',
      message: error.message
    });
  }
};

// Clear cart (remove all items)
const clearCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the cart
    const cart = await models.Cart.findByPk(id);
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found for clearing: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    // Clear all items
    await models.CartItem.destroy({
      where: { cartId: id }
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Cleared all items from cart: ${id}`);
    
    // Get the updated cart
    const updatedCart = await models.Cart.findByPk(id, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error clearing cart:`, error.message);
    res.status(500).json({
      error: 'Failed to clear cart',
      message: error.message
    });
  }
};

// Delete cart
const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the cart
    const cart = await models.Cart.findByPk(id);
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found for deletion: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    // Delete the cart (cascade will delete items)
    await cart.destroy();
    
    console.log(`[${new Date().toISOString()}] [INFO] Deleted cart: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error deleting cart:`, error.message);
    res.status(500).json({
      error: 'Failed to delete cart',
      message: error.message
    });
  }
};

// Mark cart as abandoned
const abandonCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the cart
    const cart = await models.Cart.findByPk(id);
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found for abandoning: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    // Check if cart is already abandoned or converted
    if (cart.status !== 'active') {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot abandon cart with status: ${cart.status}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot abandon cart with status: ${cart.status}`
      });
    }
    
    // Update cart status
    await cart.update({
      status: 'abandoned',
      metadata: {
        ...cart.metadata,
        abandonedAt: new Date().toISOString()
      }
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Marked cart as abandoned: ${id}`);
    
    // Get updated cart
    const updatedCart = await models.Cart.findByPk(id, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error abandoning cart:`, error.message);
    res.status(500).json({
      error: 'Failed to abandon cart',
      message: error.message
    });
  }
};

// Mark cart as converted to order
const convertCart = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the cart
    const cart = await models.Cart.findByPk(id, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    if (!cart) {
      console.log(`[${new Date().toISOString()}] [WARN] Cart not found for conversion: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Cart not found'
      });
    }
    
    // Check if cart is already converted or abandoned
    if (cart.status !== 'active') {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot convert cart with status: ${cart.status}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot convert cart with status: ${cart.status}`
      });
    }
    
    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot convert empty cart: ${id}`);
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot convert an empty cart'
      });
    }
    
    // Update cart status
    await cart.update({
      status: 'converted',
      metadata: {
        ...cart.metadata,
        convertedAt: new Date().toISOString(),
        orderId: req.body.orderId
      }
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Marked cart as converted: ${id}`);
    
    // Get updated cart
    const updatedCart = await models.Cart.findByPk(id, {
      include: [{ model: models.CartItem, as: 'items' }]
    });
    
    res.json(updatedCart);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error converting cart:`, error.message);
    res.status(500).json({
      error: 'Failed to convert cart',
      message: error.message
    });
  }
};

module.exports = {
  getCartById,
  getCartByUserId,
  createCart,
  clearCart,
  deleteCart,
  abandonCart,
  convertCart
};
