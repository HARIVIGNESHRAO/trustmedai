const configuredApiOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const API_ORIGIN = configuredApiOrigin.replace(/\/+$/, "");
export const API_URL = `${API_ORIGIN}/api`;
export const GRAFANA_URL =
  process.env.NEXT_PUBLIC_GRAFANA_URL ||
  "http://localhost:3001/d/adpxhsw/new-dashboard?orgId=1&kiosk";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  "0x4AAAAAAEsjHqMEmOnGC51E";
