/**
 * Validation utilities for client-side form validation
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} { valid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true, message: '' };
};

/**
 * Validates Indian phone number format
 * Accepts: 10 digits, +91XXXXXXXXXX, +91 XXXXXXXXXX, +91-XXXXXXXXXX
 * @param {string} phone - Phone number to validate
 * @returns {object} { valid: boolean, message: string }
 */
export const validateIndianPhone = (phone) => {
  if (!phone || phone.trim() === '') {
    // Phone is optional
    return { valid: true, message: '' };
  }

  // Remove spaces, hyphens, and parentheses
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Indian phone patterns:
  // 10 digits starting with 6-9 (domestic)
  // +91 followed by 10 digits starting with 6-9 (international)
  // 91 followed by 10 digits starting with 6-9 (country code prefix)
  const phoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      valid: false,
      message: 'Please enter a valid Indian phone number (10 digits starting with 6-9, or +91XXXXXXXXXX)',
    };
  }

  return { valid: true, message: '' };
};

/**
 * Validates contact form data
 * @param {object} formData - Form data object with name, email, phone, type
 * @returns {object} { valid: boolean, errors: object }
 */
export const validateContactForm = (formData) => {
  const errors = {};

  // Validate name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Contact name is required';
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.message;
  }

  // Validate phone (optional but validate if provided)
  if (formData.phone && formData.phone.trim() !== '') {
    const phoneValidation = validateIndianPhone(formData.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
