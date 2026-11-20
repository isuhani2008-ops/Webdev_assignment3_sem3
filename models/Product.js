
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: 2,
        maxlength: 100
    },

    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        uppercase: true,
        trim: true
    },

    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },

    description: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },

    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    },

    reorderLevel: {
        type: Number,
        default: 10,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Reorder level must be an integer'
        }
    },

    supplier: {
        type: String,
        default: 'Not specified'
    }

}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
