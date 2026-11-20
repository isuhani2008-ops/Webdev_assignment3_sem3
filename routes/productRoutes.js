
const express = require('express');

const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restockProduct,
    sellProduct,
    getLowStockProducts,
    getCategorySummary
} = require('../controllers/productController');


// REPORT ROUTES
router.get('/reports/low-stock', getLowStockProducts);

router.get('/reports/category-summary', getCategorySummary);


// CRUD ROUTES
router.post('/', createProduct);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.patch('/:id', updateProduct);

router.delete('/:id', deleteProduct);


// STOCK MANAGEMENT ROUTES
router.patch('/:id/restock', restockProduct);

router.patch('/:id/sell', sellProduct);


module.exports = router;
