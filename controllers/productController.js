
const Product = require('../models/Product');

// 1. CREATE PRODUCT
exports.createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });

    } catch (error) {
        next(error);
    }
};


// 2. GET ALL PRODUCTS
// Filtering, Sorting and Pagination
exports.getAllProducts = async (req, res, next) => {
    try {
        const {
            category,
            name,
            minPrice,
            maxPrice,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {};

        // Filter by category
        if (category) {
            filter.category = new RegExp(category, 'i');
        }

        // Search by name
        if (name) {
            filter.name = new RegExp(name, 'i');
        }

        // Filter by price
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};

            if (minPrice !== undefined) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice !== undefined) {
                filter.price.$lte = Number(maxPrice);
            }

            if (
                Object.values(filter.price).some(value => !Number.isFinite(value))
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid price filter'
                });
            }
        }

        // Pagination
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid page or limit'
            });
        }

        const skip = (pageNumber - 1) * limitNumber;

        // Sorting
        const sortOptions = {};

        if (sort) {
            sort.split(',').forEach(field => {

                const order = field.startsWith('-') ? -1 : 1;
                const fieldName = field.replace(/^-/, '');

                if ([
                    'name',
                    'price',
                    'quantity',
                    'createdAt'
                ].includes(fieldName)) {
                    sortOptions[fieldName] = order;
                }
            });
        } else {
            sortOptions.createdAt = -1;
        }

        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / limitNumber),
            data: products
        });

    } catch (error) {
        next(error);
    }
};


// 3. GET PRODUCT BY ID
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        next(error);
    }
};


// 4. UPDATE PRODUCT
exports.updateProduct = async (req, res, next) => {
    try {
        const allowedFields = [
            'name',
            'sku',
            'category',
            'description',
            'price',
            'reorderLevel',
            'supplier'
        ];

        const updates = {};

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields provided'
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });

    } catch (error) {
        next(error);
    }
};


// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};


// 6. RESTOCK PRODUCT
exports.restockProduct = async (req, res, next) => {
    try {
        const amount = Number(req.body.quantity);

        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { quantity: amount } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock increased successfully',
            data: product
        });

    } catch (error) {
        next(error);
    }
};


// 7. SELL PRODUCT
exports.sellProduct = async (req, res, next) => {
    try {
        const amount = Number(req.body.quantity);

        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer'
            });
        }

        const product = await Product.findOneAndUpdate(
            {
                _id: req.params.id,
                quantity: { $gte: amount }
            },
            {
                $inc: { quantity: -amount }
            },
            { new: true }
        );

        if (!product) {
            const exists = await Product.exists({
                _id: req.params.id
            });

            if (!exists) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Insufficient stock available'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product sold successfully',
            data: product
        });

    } catch (error) {
        next(error);
    }
};


// 8. LOW STOCK REPORT
exports.getLowStockProducts = async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: {
                $lte: ['$quantity', '$reorderLevel']
            }
        });

        res.status(200).json({
            success: true,
            totalLowStockProducts: products.length,
            data: products
        });

    } catch (error) {
        next(error);
    }
};


// 9. CATEGORY-WISE AGGREGATION
exports.getCategorySummary = async (req, res, next) => {
    try {
        const summary = await Product.aggregate([

            {
                $group: {
                    _id: '$category',

                    totalProducts: {
                        $sum: 1
                    },

                    totalQuantity: {
                        $sum: '$quantity'
                    },

                    totalInventoryValue: {
                        $sum: {
                            $multiply: ['$price', '$quantity']
                        }
                    },

                    averagePrice: {
                        $avg: '$price'
                    }
                }
            },

            {
                $sort: {
                    _id: 1
                }
            }

        ]);

        res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        next(error);
    }
};
