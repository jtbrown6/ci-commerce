const { models, constants, sequelize } = require('../models');
const { logger } = require('../utils/logger');
const { orderProcessingDuration, failedOrdersCounter } = require('../utils/metrics');
const serviceClients = require('../utils/httpClient');
const config = require('../config/config');
const Joi = require('joi');

// Validation schema for creating an order
const createOrderSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      name: Joi.string().required(),
      price: Joi.number().precision(2).positive().required(),
      quantity: Joi.number().integer().min(1).required(),
      metadata: Joi.object().allow(null)
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  billingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }),
  paymentMethod: Joi.string().valid(...Object.values(constants.PAYMENT_METHOD)),
  notes: Joi.string().allow('', null)
});

// Validation schema for updating an order
const updateOrderSchema = Joi.object({
  status: Joi.string().valid(...Object.values(constants.ORDER_STATUS)),
  paymentMethod: Joi.string().valid(...Object.values(constants.PAYMENT_METHOD)),
  paymentId: Joi.string(),
  notes: Joi.string().allow('', null),
  metadata: Joi.object()
}).min(1);

// Get all orders with filtering and pagination
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filter options
    const where = {};
    
    // Filter by user ID
    if (req.query.userId) {
      where.userId = req.query.userId;
    }
    
    // Filter by status
    if (req.query.status) {
      where.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate) {
      where.createdAt = {
        ...where.createdAt,
        [sequelize.Op.gte]: new Date(req.query.startDate)
      };
    }
    
    if (req.query.endDate) {
      where.createdAt = {
        ...where.createdAt,
        [sequelize.Op.lte]: new Date(req.query.endDate)
      };
    }
    
    // Execute query
    const { count, rows } = await models.Order.findAndCountAll({
      where,
      include: [{ model: models.OrderItem, as: 'items' }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    logger.info('Retrieved orders', {
      count,
      page,
      limit,
      filters: Object.keys(where).length > 0 ? where : 'none',
      component: 'order-controller'
    });
    
    res.json({
      orders: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Error retrieving orders', {
      error: error.message,
      stack: error.stack,
      component: 'order-controller'
    });
    
    res.status(500).json({
      error: 'Failed to retrieve orders',
      message: error.message
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await models.Order.findByPk(id, {
      include: [{ model: models.OrderItem, as: 'items' }]
    });
    
    if (!order) {
      logger.warn(`Order not found: ${id}`, {
        component: 'order-controller'
      });
      
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }
    
    logger.info(`Retrieved order: ${id}`, {
      userId: order.userId,
      status: order.status,
      component: 'order-controller'
    });
    
    res.json(order);
  } catch (error) {
    logger.error('Error retrieving order', {
      error: error.message,
      stack: error.stack,
      orderId: req.params.id,
      component: 'order-controller'
    });
    
    res.status(500).json({
      error: 'Failed to retrieve order',
      message: error.message
    });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body);
    
    if (error) {
      logger.warn('Order validation error', {
        error: error.details[0].message,
        component: 'order-controller'
      });
      
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Extract order items
    const { items, ...orderData } = value;
    
    // Calculate order totals
    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    const tax = subtotal * config.checkout.taxRate;
    const shipping = config.checkout.shippingFlatRate;
    const totalAmount = subtotal + tax + shipping;
    
    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the order
      const order = await models.Order.create({
        ...orderData,
        subtotal,
        tax,
        shipping,
        totalAmount,
        status: constants.ORDER_STATUS.CREATED
      }, { transaction: t });
      
      // Create order items
      const orderItems = await models.OrderItem.bulkCreate(
        items.map(item => ({
          ...item,
          orderId: order.id,
          subtotal: parseFloat(item.price) * item.quantity
        })),
        { transaction: t }
      );
      
      return { order, orderItems };
    });
    
    logger.info('Order created successfully', {
      orderId: result.order.id,
      userId: result.order.userId,
      totalAmount: result.order.totalAmount,
      itemCount: result.orderItems.length,
      component: 'order-controller'
    });
    
    // Get the complete order with items
    const order = await models.Order.findByPk(result.order.id, {
      include: [{ model: models.OrderItem, as: 'items' }]
    });
    
    res.status(201).json(order);
  } catch (error) {
    logger.error('Error creating order', {
      error: error.message,
      stack: error.stack,
      component: 'order-controller'
    });
    
    // Track failed orders for metrics
    failedOrdersCounter.inc({ reason: 'creation_error' });
    
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
};

// Update an order
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order
    const order = await models.Order.findByPk(id);
    
    if (!order) {
      logger.warn(`Order not found for update: ${id}`, {
        component: 'order-controller'
      });
      
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }
    
    // Validate request body
    const { error, value } = updateOrderSchema.validate(req.body);
    
    if (error) {
      logger.warn('Order update validation error', {
        error: error.details[0].message,
        orderId: id,
        component: 'order-controller'
      });
      
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Track status change for order processing duration metrics
    const oldStatus = order.status;
    const newStatus = value.status;
    
    if (newStatus && oldStatus !== newStatus) {
      if (oldStatus === constants.ORDER_STATUS.CREATED && 
          newStatus === constants.ORDER_STATUS.DELIVERED) {
        // Calculate processing time from creation to delivery
        const processingTime = (new Date() - order.createdAt) / 1000; // in seconds
        orderProcessingDuration.observe({ payment_method: order.paymentMethod || 'unknown' }, processingTime);
        
        logger.info('Order processing completed', {
          orderId: id,
          processingTime: `${processingTime.toFixed(2)}s`,
          component: 'order-controller'
        });
      }
    }
    
    // Update the order
    await order.update(value);
    
    logger.info('Order updated', {
      orderId: id,
      changes: Object.keys(value).join(', '),
      component: 'order-controller'
    });
    
    // Get the updated order with items
    const updatedOrder = await models.Order.findByPk(id, {
      include: [{ model: models.OrderItem, as: 'items' }]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    logger.error('Error updating order', {
      error: error.message,
      stack: error.stack,
      orderId: req.params.id,
      component: 'order-controller'
    });
    
    res.status(500).json({
      error: 'Failed to update order',
      message: error.message
    });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the order
    const order = await models.Order.findByPk(id);
    
    if (!order) {
      logger.warn(`Order not found for cancellation: ${id}`, {
        component: 'order-controller'
      });
      
      return res.status(404).json({
        error: 'Not found',
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled
    const cancellableStatuses = [
      constants.ORDER_STATUS.CREATED,
      constants.ORDER_STATUS.PENDING,
      constants.ORDER_STATUS.PAID
    ];
    
    if (!cancellableStatuses.includes(order.status)) {
      logger.warn(`Cannot cancel order in status: ${order.status}`, {
        orderId: id,
        component: 'order-controller'
      });
      
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot cancel an order in status: ${order.status}`
      });
    }
    
    // Cancel the order
    await order.update({
      status: constants.ORDER_STATUS.CANCELLED,
      metadata: {
        ...order.metadata,
        cancelledAt: new Date().toISOString(),
        cancelReason: req.body.reason || 'Customer requested'
      }
    });
    
    logger.info('Order cancelled', {
      orderId: id,
      reason: req.body.reason || 'Customer requested',
      component: 'order-controller'
    });
    
    // Get the updated order with items
    const updatedOrder = await models.Order.findByPk(id, {
      include: [{ model: models.OrderItem, as: 'items' }]
    });
    
    res.json(updatedOrder);
  } catch (error) {
    logger.error('Error cancelling order', {
      error: error.message,
      stack: error.stack,
      orderId: req.params.id,
      component: 'order-controller'
    });
    
    res.status(500).json({
      error: 'Failed to cancel order',
      message: error.message
    });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder
};
