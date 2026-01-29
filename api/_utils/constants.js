/**
 * Centralized constants for API endpoints.
 * Keep in sync with src/lib/constants.js
 */

// Order status values
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Payment status values
export const PAYMENT_STATUS = {
  INITIATED: "initiated",
  CAPTURED: "captured",
  FAILED: "failed",
};

// Payment methods
export const PAYMENT_METHOD = {
  CARD: "CARD",
  KNET: "KNET",
  COD: "COD",
};

// Currency
export const CURRENCY = {
  KWD: "KWD",
};

// Helper to check if order is in final state
export function isOrderFinal(status) {
  return (
    status === ORDER_STATUS.PAID ||
    status === ORDER_STATUS.FAILED ||
    status === ORDER_STATUS.CANCELLED
  );
}

// Helper to check if payment is successful
export function isPaymentSuccess(status) {
  return status === PAYMENT_STATUS.CAPTURED;
}
