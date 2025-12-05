export function getToken(): string | null {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  } catch {
    return null;
  }
}

export function getRoleFromToken(defaultRole: string = "CLIENT"): string {
  const token = getToken();
  if (!token) return defaultRole;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(typeof atob === "function" ? atob(payload) : Buffer.from(payload, "base64").toString("utf8"));
    return json?.role ? String(json.role) : defaultRole;
  } catch {
    return defaultRole;
  }
}

export function getNameFromToken(defaultName: string = "Usuario"): string {
  const token = getToken();
  if (!token) return defaultName;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(typeof atob === "function" ? atob(payload) : Buffer.from(payload, "base64").toString("utf8"));
    return json?.name ? String(json.name) : defaultName;
  } catch {
    return defaultName;
  }
}

export function isAdmin(): boolean {
  return getRoleFromToken() === "ADMIN";
}

export function isWorker(): boolean {
  return getRoleFromToken() === "WORKER";
}