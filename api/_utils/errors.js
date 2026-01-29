/**
 * Centralized error handling utilities for API endpoints.
 * Never exposes stack traces to clients - logs them server-side only.
 */

/**
 * Standard error codes for API responses
 */
export const ERROR_CODES = {
  // Auth errors
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",

  // Validation errors
  BAD_REQUEST: "bad_request",
  NOT_FOUND: "not_found",
  METHOD_NOT_ALLOWED: "method_not_allowed",

  // Payment errors
  PAYMENT_FAILED: "payment_failed",
  PAYMENT_VERIFICATION_FAILED: "payment_verification_failed",
  INVALID_SIGNATURE: "invalid_signature",

  // Order errors
  ORDER_NOT_FOUND: "order_not_found",
  DELETE_FAILED: "delete_failed",

  // Generic errors
  INTERNAL_ERROR: "internal_error",
};

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId() {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Log error server-side with full details
 */
function logError(endpoint, error, errorId) {
  console.error(`[${errorId}] ${endpoint} error:`, {
    message: error?.message || String(error),
    stack: error?.stack,
    name: error?.name,
  });
}

/**
 * Send a standardized error response.
 * Never includes stack traces or sensitive details.
 *
 * @param {object} res - Express/Vercel response object
 * @param {number} status - HTTP status code
 * @param {string} code - Error code from ERROR_CODES
 * @param {string} [message] - Optional user-friendly message
 * @param {Error} [error] - Optional error object for logging
 * @param {string} [endpoint] - Optional endpoint name for logging
 */
export function sendError(res, status, code, message = null, error = null, endpoint = null) {
  const errorId = generateErrorId();

  if (error) {
    logError(endpoint || "unknown", error, errorId);
  }

  const response = {
    error: code,
    errorId,
  };

  if (message) {
    response.message = message;
  }

  return res.status(status).json(response);
}

/**
 * Wrapper for handling async endpoint errors
 */
export function withErrorHandler(endpoint, handler) {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      return sendError(res, 500, ERROR_CODES.INTERNAL_ERROR, null, error, endpoint);
    }
  };
}
