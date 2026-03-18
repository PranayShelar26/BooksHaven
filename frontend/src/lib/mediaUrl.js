export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  const apiBase = import.meta.env.VITE_API_BASE_URL || "";

  const origin = apiBase.endsWith("/api")
    ? apiBase.slice(0, -4)
    : apiBase;

  return `${origin}${path}`;
}