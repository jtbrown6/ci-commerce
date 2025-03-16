const { models } = require('../models');
const Joi = require('joi');

// Validation schema for creating/updating category
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().allow('', null),
  slug: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true)
});

// Get all categories
const getCategories = async (req, res) => {
  try {
    // Get only active categories if specified
    const where = {};
    if (req.query.active !== undefined) {
      where.isActive = req.query.active === 'true';
    }
    
    const categories = await models.Category.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved ${categories.length} categories`);
    
    res.json(categories);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error getting categories:`, error.message);
    res.status(500).json({
      error: 'Failed to get categories',
      message: error.message
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await models.Category.findByPk(id, {
      include: [{ model: models.Product, as: 'products' }]
    });
    
    if (!category) {
      console.log(`[${new Date().toISOString()}] [WARN] Category not found with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Category not found'
      });
    }
    
    console.log(`[${new Date().toISOString()}] [INFO] Retrieved category: ${category.id} - ${category.name}`);
    
    res.json(category);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error getting category:`, error.message);
    res.status(500).json({
      error: 'Failed to get category',
      message: error.message
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = categorySchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Validation error creating category:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Check if category with the same name already exists
    const existingCategory = await models.Category.findOne({
      where: { name: value.name }
    });
    
    if (existingCategory) {
      console.log(`[${new Date().toISOString()}] [WARN] Category with name '${value.name}' already exists`);
      return res.status(409).json({
        error: 'Duplicate category',
        message: `Category with name '${value.name}' already exists`
      });
    }
    
    // Create the category
    const category = await models.Category.create(value);
    
    console.log(`[${new Date().toISOString()}] [INFO] Created new category: ${category.id} - ${category.name}`);
    
    res.status(201).json(category);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error creating category:`, error.message);
    res.status(500).json({
      error: 'Failed to create category',
      message: error.message
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the category
    const category = await models.Category.findByPk(id);
    
    if (!category) {
      console.log(`[${new Date().toISOString()}] [WARN] Category not found for update with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Category not found'
      });
    }
    
    // Validate request body
    const { error, value } = categorySchema.validate(req.body);
    
    if (error) {
      console.log(`[${new Date().toISOString()}] [WARN] Validation error updating category:`, error.details[0].message);
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // Check if another category with the same name exists
    if (value.name !== category.name) {
      const existingCategory = await models.Category.findOne({
        where: { name: value.name }
      });
      
      if (existingCategory) {
        console.log(`[${new Date().toISOString()}] [WARN] Category with name '${value.name}' already exists`);
        return res.status(409).json({
          error: 'Duplicate category',
          message: `Category with name '${value.name}' already exists`
        });
      }
    }
    
    // Update the category
    await category.update(value);
    
    console.log(`[${new Date().toISOString()}] [INFO] Updated category: ${category.id} - ${category.name}`);
    
    res.json(category);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error updating category:`, error.message);
    res.status(500).json({
      error: 'Failed to update category',
      message: error.message
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the category
    const category = await models.Category.findByPk(id, {
      include: [{ model: models.Product, as: 'products' }]
    });
    
    if (!category) {
      console.log(`[${new Date().toISOString()}] [WARN] Category not found for deletion with ID: ${id}`);
      return res.status(404).json({
        error: 'Not found',
        message: 'Category not found'
      });
    }
    
    // Check if category has products
    if (category.products && category.products.length > 0) {
      console.log(`[${new Date().toISOString()}] [WARN] Cannot delete category ${category.id} - ${category.name} because it has ${category.products.length} products`);
      return res.status(409).json({
        error: 'Category in use',
        message: `Cannot delete category because it has ${category.products.length} products`,
        products: category.products.map(p => ({ id: p.id, name: p.name }))
      });
    }
    
    // Delete the category
    await category.destroy();
    
    console.log(`[${new Date().toISOString()}] [INFO] Deleted category: ${id} - ${category.name}`);
    
    res.status(204).send();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error deleting category:`, error.message);
    res.status(500).json({
      error: 'Failed to delete category',
      message: error.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
