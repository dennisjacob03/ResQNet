/**
 * Central API Configuration
 * Uses VITE_API_BASE_URL when deployed (e.g. Render / Production)
 * and falls back to http://localhost:5000 for local development.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

/**
 * Helper to get absolute media/upload URL
 * @param {string} path - relative or absolute upload path
 * @returns {string} full image/media URL
 */
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/uploads/${path.startsWith('/') ? path.slice(1) : path}`;
};

export default API_BASE_URL;
