const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

// GET /products - Get all products with filtering and pagination
router.get('/', productController.getProducts);

// GET /products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /products - Create new product
router.post('/', productController.createProduct);

// PUT /products/:id - Update product
router.put('/:id', productController.updateProduct);

// DELETE /products/:id - Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
