/**
 * Centralized constants for the application.
 * These ensure consistency across frontend and backend.
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
  COD: "COD", // Cash on delivery
};

// Currency
export const CURRENCY = {
  KWD: "KWD",
};

// Cookie names
export const COOKIES = {
  GUEST_ID: "kuwaitmart.guest.id",
  AUTH_SESSION: "kuwaitmart-auth",
};

// Local storage keys
export const STORAGE_KEYS = {
  CART_TOKEN: "kuwaitmart.cart.token",
  AUTH_SESSION: "kuwaitmart-auth",
};

// z-index scale for consistent layering
export const Z_INDEX = {
  DROPDOWN: 10,
  CATEGORY_BAR: 20,
  HEADER: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOAST: 60,
  AUTH_MODAL: 100,
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
