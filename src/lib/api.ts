// Route API requests through the Next.js backend proxy.

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `/api/backend${normalizedPath.replace(/^\/api/, "")}`;
};