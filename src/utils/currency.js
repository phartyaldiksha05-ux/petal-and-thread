const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a numeric amount in Indian Rupees (e.g., ₹1,299.00) using the Indian numbering system.
 * Does not mutate or convert underlying stored numeric values.
 */
export function formatPrice(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) {
    return inrFormatter.format(0);
  }
  return inrFormatter.format(num);
}
