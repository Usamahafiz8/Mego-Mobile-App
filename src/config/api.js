// API Configuration
export const API_BASE_URL = "http://192.168.0.110:5144";
export const FULL_API_URL = `${API_BASE_URL}/v1`;

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};
