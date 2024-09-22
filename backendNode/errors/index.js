const CustomApiError = require("./CustomApiError.js");

class NotFoundError extends CustomApiError {
    constructor(msg) {
        super(msg || "Not Found", 404);
    }
}

class BadRequestError extends CustomApiError {
    constructor(msg) {
        super(msg || "Bad Request", 400);
    }
}

class UnauthorizedError extends CustomApiError {
    constructor(msg) {
        super(msg || "Unauthorized", 401);
    }
}

class ForbiddenError extends CustomApiError {
    constructor(msg) {
        super(msg || "Forbidden", 403);
    }
}

class InternalServerError extends CustomApiError {
    constructor(msg) {
        super(msg || "Internal Server Error", 500);
    }
}

module.exports = {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    InternalServerError,
};
