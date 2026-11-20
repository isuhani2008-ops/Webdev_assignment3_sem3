
require('dotenv').config();

const express = require('express');

const connectDB = require('./config/db');

const productRoutes = require('./routes/productRoutes');

const errorHandler = require('./middleware/errorMiddleware');

const app = express();


// JSON MIDDLEWARE
app.use(express.json());


// HOME ROUTE
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Inventory Management API is Running'
    });
});


// PRODUCT ROUTES
app.use('/api/products', productRoutes);


// INVALID ROUTE HANDLER
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});


// ERROR HANDLING MIDDLEWARE
app.use(errorHandler);


// START SERVER
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();
