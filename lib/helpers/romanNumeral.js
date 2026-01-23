// Utility functions to convert numbers / indices to Roman numerals.
// Typical Roman numerals are defined for 1..3999. Beyond that we can extend by repeating 'M'.
// If you need overlines (V̄, X̄, etc.) adopt another strategy later.

/**
 * Convert a positive integer (1-based) to a Roman numeral.
 * @param {number} num Integer >= 1
 * @returns {string} Roman numeral string, or empty string if invalid.
 */
export function toRoman(num) {
  if (typeof num !== 'number') num = Number(num);
  if (!Number.isInteger(num) || num <= 0) return '';
  // Allow numbers > 3999 by concatenating extra 'M'. (Basic extension)
  let result = '';
  // Prepend Ms for thousands beyond 3000 if needed
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    result += 'M'.repeat(thousands);
    num = num % 1000; // remainder
  }

  const map = [
    { value: 900, symbol: 'CM' },
    { value: 500, symbol: 'D' },
    { value: 400, symbol: 'CD' },
    { value: 100, symbol: 'C' },
    { value: 90, symbol: 'XC' },
    { value: 50, symbol: 'L' },
    { value: 40, symbol: 'XL' },
    { value: 10, symbol: 'X' },
    { value: 9, symbol: 'IX' },
    { value: 5, symbol: 'V' },
    { value: 4, symbol: 'IV' },
    { value: 1, symbol: 'I' }
  ];

  for (const { value, symbol } of map) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

/**
 * Convert a zero-based index (0 -> I, 1 -> II, ...) to Roman numeral.
 * @param {number} index Zero-based index.
 * @returns {string} Roman numeral or empty string if invalid.
 */
export function indexToRoman(index) {
  if (typeof index !== 'number') index = Number(index);
  if (!Number.isInteger(index) || index < 0) return '';
  return toRoman(index + 1);
}

/**
 * Attempt reverse conversion (Roman -> integer). Basic, supports standard forms.
 * @param {string} roman Roman numeral string
 * @returns {number} integer value or NaN if invalid
 */
export function fromRoman(roman) {
  if (typeof roman !== 'string' || !roman.trim()) return NaN;
  const map = new Map([
    ['I', 1], ['V', 5], ['X', 10], ['L', 50], ['C', 100], ['D', 500], ['M', 1000]
  ]);
  let total = 0;
  let prev = 0;
  for (let i = roman.length - 1; i >= 0; i--) {
    const ch = roman[i].toUpperCase();
    const val = map.get(ch);
    if (!val) return NaN;
    if (val < prev) total -= val; else total += val;
    prev = val;
  }
  return total;
}
