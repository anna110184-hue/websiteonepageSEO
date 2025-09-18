// Common Supabase types and schemas for TypeScript/JSDoc

/**
 * @typedef {Object} SupabaseResponse
 * @property {any} data - The response data
 * @property {Object|null} error - Error object if operation failed
 * @property {string} error.message - Error message
 * @property {string} error.code - Error code
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {Object} user_metadata - User metadata
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 */

/**
 * @typedef {Object} DatabaseFilter
 * @property {string} operator - Filter operator (eq, neq, gt, gte, lt, lte, like, ilike, in)
 * @property {any} value - Filter value
 */

/**
 * Common database operations configuration
 */
export const DatabaseOperations = {
  // Filter operators
  OPERATORS: {
    EQUALS: 'eq',
    NOT_EQUALS: 'neq',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL: 'gte',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL: 'lte',
    LIKE: 'like',
    ILIKE: 'ilike',
    IN: 'in',
    IS: 'is',
    CONTAINS: 'cs',
    CONTAINED_BY: 'cd'
  },

  // Common column selections
  COLUMNS: {
    ALL: '*',
    COUNT: 'count',
    ID_ONLY: 'id'
  }
}

/**
 * Authentication event types
 */
export const AuthEvents = {
  SIGNED_IN: 'SIGNED_IN',
  SIGNED_OUT: 'SIGNED_OUT',
  TOKEN_REFRESHED: 'TOKEN_REFRESHED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_RECOVERY: 'PASSWORD_RECOVERY'
}

/**
 * Error codes commonly returned by Supabase
 */
export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'invalid_grant',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  SIGNUP_DISABLED: 'signup_disabled',

  // Database errors
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',

  // RLS (Row Level Security) errors
  INSUFFICIENT_PRIVILEGE: '42501',
  RLS_VIOLATION: 'PGRST116'
}