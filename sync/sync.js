// v0.1
goog.provide('mvc.ync');

/**
 * @enum {number}
 */
mvc.Sync.Status = {
    // Successful
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    // Client Error
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    // Server Error
    INTERNAL_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    GATEWAY_TIMEOUT: 504
}

/**
 * Sync object used to communicate between model and source
 *
 * @interface
 */
mvc.Sync = function() {};

/**
 * take in the model to push to server (use .toJson()) and call callback when done
 * pass in the json and status (use HTTP status codes) as a number
 *
 * @param {mvc.Model} model
 * @param {function(Object, number)} callback
 */
mvc.Sync.prototype.create = function(model, callback) {};

/**
 * take in the model to push to server (use .toJson()) and call callback when done
 * pass in the json and status (use HTTP status codes) as a number
 *
 * @param {mvc.Model} model
 * @param {function(Object, number)} callback
 */
mvc.Sync.prototype.read = function(model, callback) {};

/**
 * take in the model to push to server (use .toJson()) and call callback when done
 * pass in the json and status (use HTTP status codes) as a number
 *
 * @param {mvc.Model} model
 * @param {function(Object, number)} callback
 */
mvc.Sync.prototype.update = function(model, callback) {};

/**
 * take in the model to push to server (use .toJson()) and call callback when done
 * pass in the status (use HTTP status codes) as a number
 *
 * @param {mvc.Model} model
 * @param {function(number)} callback
 */
mvc.Sync.prototype.delete = function(model, callback) {};
