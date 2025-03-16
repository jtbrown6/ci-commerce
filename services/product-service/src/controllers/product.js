const { models, sequelize } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

// Validation schema for creating product
const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().precision(2).positive().required(),
  imageUrl: Joi.string().uri().allow('', null),
  sku: Joi.string().required(),
  stockQuantity: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
  slug: Joi.string().allow('', null),
  weight: Joi.number().allow(null),
  dimensions: Joi.object({
    length: Joi.number().default(0),
    width: Joi.number().default(0),
    height: Joi.number().default(0)
  }).allow(null),
  features: Joi.object().allow(null),
  categoryIds: Joi.array().items(Joi.string().uuid()).default([])
});

// Get all products with filtering and pagination
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build filter options
    const where = {};
    
    // Filter by active status if specified
    if (req.query.active !== undefined) {
      where.isActive = req.query.active === 'true';
    }
    
    // Filter by price range
    if (req.query.minPrice !== undefined) {
      where.price = { 
        ...where.price,
        [Op.gte]: parseFloat(req.query.minPrice) 
      };
    }
    
    if (req.query.maxPrice !== undefined) {
      where.price = { 
        ...where.price,
        [Op.lte]: parseFloat(req.query.maxPrice) 
      };
    }
    
    // Filter by category
    let include = [{ model: models.Category, as: 'categories' }];
    if (req.query.categoryId) {
      include = [{
        model: models.Category,
        as: 'categories',
        where: { id: req.query.categoryId }
      }];
    }
    
    // Search by name/description
    if (req.query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    // Execute query
    const { rows, count } = await models.Product.findAndCountAll({
      where,
      include,
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved ${rows.length} products (page ${page}, limit ${limit})`);
    
    res.json({
      products: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error getting products:`, error.message);
    res.status(500).json({
      error: 'Failed to get products',
      message: error.message
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await models.Product.findByPk(id, {
      include: [{ model: models.Category, as: 'categories' }]
    });
    
    if (!product) {
      console.log(`[${new Date().toISOString()}] [WARN] Product not found with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved product: ${product.id} - ${product.name}`);
    
    res.json(product);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error getting product:`, error.message);
    res.status(500).json({
      error: 'Failed to get product',
      message: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createProductSchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Validation error creating product:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Extract category IDs from request
    const { categoryIds, ...productData } = value;
    
    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the product
      const product = await models.Product.create(productData, { transaction: t });
      
      // Add categories if specified
      if (categoryIds && categoryIds.length > 0) {
        const categories = await models.Category.findAll({
          where: { id: categoryIds },
          transaction: t
        });
        
        await product.setCategories(categories, { transaction: t });
        console.log(`[${new Date().toISOString()}] [INFO] Added ${categories.length} categories to product ${product.id}`);
      }
      
      return product;
    });
    
    // Get the newly created product with its categories
    const product = await models.Product.findByPk(result.id, {
      include: [{ model: models.Category, as: 'categories' }]
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Created new product: ${product.id} - ${product.name}`);
    
    res.status(201).json(product);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error creating product:`, error.message);
    res.status(500).json({
      error: 'Failed to create product',
      message: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product
    const product = await models.Product.findByPk(id);
    
    if (!product) {
      console.log(`[${new Date().toISOString()}] [WARN] Product not found for update with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }
    
    // Extract category IDs from request
    const { categoryIds, ...updateData } = req.body;
    
    // Start a transaction
    await sequelize.transaction(async (t) => {
      // Update the product
      await product.update(updateData, { transaction: t });
      
      // Update categories if specified
      if (categoryIds !== undefined) {
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
          const categories = await models.Category.findAll({
            where: { id: categoryIds },
            transaction: t
          });
          
          await product.setCategories(categories, { transaction: t });
          console.log(`[${new Date().toISOString()}] [INFO] Updated categories for product ${product.id}`);
        } else {
          // Clear all categories if empty array provided
          await product.setCategories([], { transaction: t });
          console.log(`[${new Date().toISOString()}] [INFO] Removed all categories from product ${product.id}`);
        }
      }
    });
    
    // Get the updated product with its categories
    const updatedProduct = await models.Product.findByPk(id, {
      include: [{ model: models.Category, as: 'categories' }]
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Updated product: ${updatedProduct.id} - ${updatedProduct.name}`);
    
    res.json(updatedProduct);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error updating product:`, error.message);
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the product
    const product = await models.Product.findByPk(id);
    
    if (!product) {
      console.log(`[${new Date().toISOString()}] [WARN] Product not found for deletion with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Product not found'
      });
    }
    
    // Delete the product
    await product.destroy();
    
    console.log(`[${new Date().toISOString()}] [INFO] Deleted product: ${id}`);
    
    res.status(204).send();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error deleting product:`, error.message);
    res.status(500).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
