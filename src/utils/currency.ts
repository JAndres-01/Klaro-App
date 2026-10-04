/**
 * Formats a numeric value into clean monochromatic currency string without excess decorations.
 * Example: 12500 -> "$12,500.00" or "$12,500"
 */
export function formatCurrency(
  amount: number,
  options?: { showDecimals?: boolean; currencySymbol?: string }
): string {
  const { showDecimals = true, currencySymbol = '$' } = options ?? {};
  
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currencySymbol}${formattedNumber}`;
}
