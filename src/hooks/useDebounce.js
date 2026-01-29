import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a value.
 * Returns the debounced value after the specified delay.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for debounced callback.
 * Returns a function that will only execute after the specified delay.
 *
 * @param {function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {function} The debounced callback
 */
export function useDebouncedCallback(callback, delay = 300) {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(newTimeoutId);
  };
}
