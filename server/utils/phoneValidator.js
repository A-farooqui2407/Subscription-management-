/**
 * Validation utilities for backend
 */

/**
 * Validates Indian phone number
 * Accepts: 10 digits, +91XXXXXXXXXX, +91 XXXXXXXXXX, +91-XXXXXXXXXX, 0XXXXXXXXXX
 * @param {string} phone - Phone number to validate
 * @returns {boolean} true if valid, false otherwise
 */
function validateIndianPhone(phone) {
  if (!phone || phone.trim() === '') {
    // Phone is optional
    return true;
  }

  // Remove spaces, hyphens, and parentheses
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Indian phone patterns:
  // 10 digits starting with 6-9 (domestic)
  // +91 followed by 10 digits starting with 6-9 (international)
  // 91 followed by 10 digits starting with 6-9 (country code prefix)
  // 0 followed by 10 digits starting with 6-9 (with leading 0)
  const phoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;

  return phoneRegex.test(cleaned);
}

/**
 * Formats phone number to standard format
 * Stores the cleaned version in database
 * @param {string} phone - Phone number to format
 * @returns {string|null} Formatted phone or null if empty
 */
function formatPhone(phone) {
  if (!phone || phone.trim() === '') {
    return null;
  }

  // Remove spaces, hyphens, and parentheses
  let cleaned = phone.replace(/[\s\-().]/g, '');

  // Remove leading 0 if present before +91 or 91
  if (cleaned.match(/^0[6-9]/)) {
    cleaned = cleaned.substring(1);
  }

  // Handle +91 prefix
  if (cleaned.startsWith('+91')) {
    return cleaned; // Keep +91 format
  }
  if (cleaned.startsWith('91')) {
    return '+' + cleaned; // Convert to +91 format
  }

  // If just 10 digits, add +91
  if (cleaned.match(/^[6-9]\d{9}$/)) {
    return '+91' + cleaned;
  }

  return cleaned;
}

module.exports = {
  validateIndianPhone,
  formatPhone,
};
