export const successResponse = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        data:data,
        message: message,
    });
}

export const errorResponse = (res, statusCode, error, message) => {
    return res.status(statusCode).json({
        success: false,
        message: message,
    });
}