/**
 * Cookie utilities for synchronizing client session with Next.js edge/server middleware
 */

export function setSessionCookie(data: { id: string; email: string; role: string; status: string }): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(data));
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `sw_session=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "sw_session=; path=/; max-age=0; SameSite=Lax";
}

export function getSessionCookie(): { id: string; email: string; role: string; status: string } | null {
  if (typeof document === "undefined") return null;
  const matches = document.cookie.match(new RegExp("(?:^|; )sw_session=([^;]*)"));
  if (!matches || !matches[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(matches[1]));
  } catch {
    return null;
  }
}
