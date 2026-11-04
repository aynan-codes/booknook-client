const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Build absolute API URLs; tolerates a trailing slash in the base URL.
export const apiUrl = (path: string) =>
  `${API_BASE.replace(/\/+$/, "")}${path}`;
