/**
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  // placeholder
}

/**
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  // placeholder
}

/**
 * @param {string} password
 * @returns {boolean}
 */
export function isStrongPassword(password) {
  // placeholder
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNotEmpty(value) {
  // placeholder
}
// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  // placeholder
}

/**
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  // placeholder
}

/**
 * @param {string} password
 * @returns {boolean}
 */
export function isStrongPassword(password) {
  // placeholder
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNotEmpty(value) {
  // placeholder
}
/**
 * Common validation helpers used across forms.
 */

/** Check that a value is not empty / null / undefined. */
export const isRequired = (value) => !!value && String(value).trim().length > 0

/** Validate an email address format. */
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

/**
 * Validate password strength.
 * Requires at least 8 chars with 1 uppercase, 1 lowercase, and 1 digit.
 */
export const isStrongPassword = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value)

/** Validate a Vietnamese phone number (10 digits starting with 0). */
export const isVietnamesePhone = (value) => /^0[0-9]{9}$/.test(value)

/**
 * Validate that two values match (e.g. password confirmation).
 * @param {*} value
 * @param {*} compareTo
 */
export const matches = (value, compareTo) => value === compareTo

/**
 * Compose multiple validators and return the first error message or null.
 * @param {*} value - The value to validate.
 * @param {Array<{fn: Function, message: string}>} rules
 * @returns {string|null}
 */
export function validate(value, rules) {
  for (const { fn, message } of rules) {
    if (!fn(value)) return message
  }
  return null
}
