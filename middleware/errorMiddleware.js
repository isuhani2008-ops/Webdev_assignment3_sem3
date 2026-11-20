
const errorHandler = (err, req, res, next) => {

    console.error(err);

    let statusCode = 500;
    let message = 'Internal Server Error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // Invalid MongoDB ID
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid product ID';
    }

    // Duplicate SKU
    else if (err.code === 11000) {
        statusCode = 400;
        message = 'SKU already exists';
    }

    // Invalid JSON
    else if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON request body';
    }

    res.status(statusCode).json({
        success: false,
        message: message
    });
};

module.exports = errorHandler;
