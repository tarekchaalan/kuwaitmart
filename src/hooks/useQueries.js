import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchProducts,
  fetchProductBySlug,
  validateCoupon,
} from "../lib/api.js";

/**
 * Query keys for cache management
 */
export const queryKeys = {
  categories: ["categories"],
  products: (params) => ["products", params],
  product: (slug) => ["product", slug],
  coupon: (code) => ["coupon", code],
};

/**
 * Hook to fetch all categories
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // Categories rarely change - 10 minutes
  });
}

/**
 * Hook to fetch products with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {string} params.categoryId - Category ID or "all"
 * @param {string} params.q - Search query
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useProducts({ page = 1, categoryId = "all", q = "" }) {
  return useQuery({
    queryKey: queryKeys.products({ page, categoryId, q }),
    queryFn: () => fetchProducts({ page, categoryId, q }),
    staleTime: 2 * 60 * 1000, // 2 minutes for product listings
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
  });
}

/**
 * Hook to fetch a single product by slug
 * @param {string} slug - Product slug
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useProduct(slug, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: () => fetchProductBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual products
  });
}

/**
 * Hook to validate a coupon code
 * @param {string} code - Coupon code
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether to enable the query
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useCouponValidation(code, { enabled = true } = {}) {
  return useQuery({
    queryKey: queryKeys.coupon(code),
    queryFn: () => validateCoupon(code),
    enabled: enabled && !!code,
    staleTime: 30 * 1000, // 30 seconds - coupons can have usage limits
    retry: false, // Don't retry coupon validation
  });
}

/**
 * Hook to invalidate product queries (useful after mutations)
 * @returns {Object} - Invalidation functions
 */
export function useInvalidateProducts() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: ["products"] }),
    invalidateProduct: (slug) =>
      queryClient.invalidateQueries({ queryKey: queryKeys.product(slug) }),
    invalidateCategories: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  };
}
