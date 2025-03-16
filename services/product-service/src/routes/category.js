const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');

// GET /categories - Get all categories
router.get('/', categoryController.getCategories);

// GET /categories/:id - Get category by ID
router.get('/:id', categoryController.getCategoryById);

// POST /categories - Create new category
router.post('/', categoryController.createCategory);

// PUT /categories/:id - Update category
router.put('/:id', categoryController.updateCategory);

// DELETE /categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
