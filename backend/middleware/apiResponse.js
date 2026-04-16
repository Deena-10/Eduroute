// backend/middleware/apiResponse.js

/**
 * Standardizes API responses across the application
 */
const responseHelper = (req, res, next) => {
    res.success = (data, message = "Success", status = 200) => {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    };

    res.error = (_error, message = "An error occurred", status = 500) => {
        return res.status(status).json({
            success: false,
            message
        });
    };

    next();
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.url}:`, err);

    const isDbError =
        Boolean(err?.code && String(err.code).startsWith("P")) || // Prisma (P1001, etc.)
        Boolean(err?.code && String(err.code).match(/^\d{5}$/)) || // Postgres SQLSTATE
        /database|postgres|prisma|connection|relation|table|column/i.test(String(err?.message || ""));

    const status = err.status || (isDbError ? 503 : 500);
    const message = isDbError
        ? "Database temporarily unavailable. Please try again shortly."
        : "Internal Server Error";

    return res.status(status).json({
        success: false,
        message,
    });
};

module.exports = { responseHelper, errorHandler };
