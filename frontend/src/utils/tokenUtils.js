/**
 * Token utility functions for JWT handling
 */

/**
 * Decodes a JWT token and returns its payload
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a token will expire within a certain time frame
 * @param {string} token - JWT token to check
 * @param {number} [timeFrameMs=5*60*1000] - Time frame in milliseconds (default: 5 minutes)
 * @returns {boolean} - True if token expires within timeFrame, false otherwise
 */
export const willTokenExpireSoon = (token, timeFrameMs = 5 * 60 * 1000) => {
  if (!token) return true;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return true;
  
  // Convert exp to milliseconds (it's in seconds in JWT)
  const expiryTime = decodedToken.exp * 1000;
  const currentTime = Date.now();
  
  // Token will expire soon if current time + timeFrame is greater than expiry time
  return currentTime + timeFrameMs > expiryTime;
};

/**
 * Get the expiry time of a token
 * @param {string} token - JWT token 
 * @returns {number|null} - Expiry timestamp in milliseconds or null if invalid
 */
export const getTokenExpiryTime = (token) => {
  if (!token) return null;
  
  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return null;
  
  // Convert exp to milliseconds (it's in seconds in JWT)
  return decodedToken.exp * 1000;
};
