export const DEFAULT_ADMIN_PATH = "/admin";

let activeAdminPath = DEFAULT_ADMIN_PATH;

export function normalizeAdminPath(value?: string | null) {
  const trimmed = (value || "").trim();
  if (!trimmed) return DEFAULT_ADMIN_PATH;
  if (trimmed.length === 1) return trimmed;
  return trimmed.replace(/\/+$/, "") || trimmed;
}

export function setAdminPath(value?: string | null) {
  const normalized = normalizeAdminPath(value);
  activeAdminPath = validateAdminPathInput(normalized) ? DEFAULT_ADMIN_PATH : normalized;
  return activeAdminPath;
}

export function getAdminPath() {
  return activeAdminPath;
}

export function adminPath(suffix = "") {
  const base = activeAdminPath;
  if (!suffix) return base;
  if (suffix.startsWith("?") || suffix.startsWith("#")) return `${base}${suffix}`;
  return suffix.startsWith("/") ? `${base}${suffix}` : `${base}/${suffix}`;
}

export function routeWithAdminPath(path: string) {
  if (path === DEFAULT_ADMIN_PATH) return activeAdminPath;
  if (path.startsWith(`${DEFAULT_ADMIN_PATH}/`)) {
    return `${activeAdminPath}${path.slice(DEFAULT_ADMIN_PATH.length)}`;
  }
  return path;
}

export function isCurrentAdminPath(pathname: string) {
  return pathname === activeAdminPath || pathname.startsWith(`${activeAdminPath}/`);
}

export function isLegacyAdminPath(pathname: string) {
  return pathname === DEFAULT_ADMIN_PATH || pathname.startsWith(`${DEFAULT_ADMIN_PATH}/`);
}

export function legacyAdminPathToCurrent(pathname: string) {
  if (pathname === DEFAULT_ADMIN_PATH) return activeAdminPath;
  if (pathname.startsWith(`${DEFAULT_ADMIN_PATH}/`)) {
    return `${activeAdminPath}${pathname.slice(DEFAULT_ADMIN_PATH.length)}`;
  }
  return pathname;
}

export function adminLoginPath(next?: string) {
  const path = adminPath("/login");
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

export function safeAdminNextPath(rawNext: string | null) {
  const fallback = adminPath();
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//") || rawNext.startsWith("\\")) {
    return fallback;
  }
  try {
    const next = new URL(rawNext, window.location.origin);
    let pathname = next.pathname;
    if (activeAdminPath !== DEFAULT_ADMIN_PATH && isLegacyAdminPath(pathname)) {
      pathname = legacyAdminPathToCurrent(pathname);
    }
    if (
      next.origin !== window.location.origin ||
      pathname === adminPath("/login") ||
      pathname === "/login" ||
      !isCurrentAdminPath(pathname) ||
      isNonPageNextPath(pathname)
    ) {
      return fallback;
    }
    return `${pathname}${next.search}${next.hash}`;
  } catch {
    return fallback;
  }
}

export function validateAdminPathInput(value: string) {
  const path = normalizeAdminPath(value);
  if (path === "/" || !path.startsWith("/") || path.startsWith("//") || path.startsWith("\\")) {
    return "后台管理员地址必须是以 / 开头的站内路径。";
  }
  if (path.length > 64) return "后台管理员地址不能超过 64 个字符。";
  if (/\/\/|\s|[?#\\]/.test(path)) return "后台管理员地址格式不合法。";
  if (!/^\/[A-Za-z0-9._~/-]+$/.test(path)) return "后台管理员地址只能包含英文、数字、/、-、_、.、~。";
  const reserved = [
    "/api",
    "/v1",
    "/gateway",
    "/site",
    "/ws",
    "/metrics",
    "/healthz",
    "/readyz",
    "/login",
    "/console",
    "/channels",
    "/dashboard",
    "/pricing",
    "/recommend",
    "/assets",
    "/icons",
    "/manifest.webmanifest",
    "/sw.js",
    "/favicon.ico",
    "/openapi.yaml",
    "/docs",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt"
  ];
  for (const prefix of reserved) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return `后台管理员地址不能占用系统路径 ${prefix}。`;
  }
  return "";
}

function isNonPageNextPath(pathname: string) {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/gateway/") ||
    pathname.startsWith("/v1/") ||
    pathname.startsWith("/ws/") ||
    pathname === "/metrics" ||
    pathname === "/healthz" ||
    pathname === "/readyz"
  );
}
