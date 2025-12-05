const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

type JsonValue = unknown;
type ApiEnvelope<T = JsonValue> = { success?: boolean; message?: string; data?: T } | T;

function extractMessage(raw: unknown): string | undefined {
  if (raw && typeof raw === "object" && "message" in raw) {
    const value = (raw as { message?: unknown }).message;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

function unwrapEnvelope<T>(body: ApiEnvelope<T>): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function request<T = JsonValue>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const raw = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? extractMessage(raw) || JSON.stringify(raw) : String(raw);
    throw new Error(message || `HTTP ${res.status}`);
  }

  const body = raw as ApiEnvelope<T>;
  return unwrapEnvelope(body);
}

const http = {
  get: <T = JsonValue>(path: string) => request<T>(path, { method: "GET" }),
  post: <T = JsonValue>(path: string, payload?: unknown) =>
    request<T>(path, { method: "POST", body: payload ? JSON.stringify(payload) : undefined }),
  put: <T = JsonValue>(path: string, payload?: unknown) =>
    request<T>(path, { method: "PUT", body: payload ? JSON.stringify(payload) : undefined }),
  del: <T = JsonValue>(path: string) => request<T>(path, { method: "DELETE" }),
};

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) => http.post("/auth/register", payload),
  login: (payload: { email: string; password: string }) => http.post("/auth/login", payload),
  createUser: (payload: { name: string; email: string; password: string; role: "ADMIN" | "WORKER" | "CLIENT" }) =>
    http.post("/auth/create-user", payload),

  // Services
  getServices: () => http.get<unknown[]>("/services"),
  createService: (payload: { name: string; description?: string; price: number; duration?: number }) =>
    http.post("/services", payload),
  updateService: (id: number, payload: Record<string, unknown>) => http.put(`/services/${id}`, payload),
  deleteService: (id: number) => http.del(`/services/${id}`),

  // Bookings
  createBooking: (payload: { serviceId: number; date: string; time: string; notes?: string }) =>
    http.post("/bookings", payload),
  myBookings: () => http.get<unknown[]>("/bookings/me"),
  allBookings: () => http.get<unknown[]>("/bookings"),
  updateBookingStatus: (id: number, status: string) => http.put(`/bookings/${id}/status`, { status }),

  // Users (admin)
  listUsers: () => http.get<unknown[]>("/users"),
  updateUserStatus: (id: number, isActive: boolean) => http.put(`/users/${id}/status`, { isActive }),
};

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("auth_token", token);
    window.dispatchEvent(new Event("auth_token_change"));
  } catch {}
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth_token");
    window.dispatchEvent(new Event("auth_token_change"));
  } catch {}
}
