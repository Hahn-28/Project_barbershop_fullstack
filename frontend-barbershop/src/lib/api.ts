export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  // Use a plain record to avoid indexing issues with HeadersInit union type
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson ? data?.message || JSON.stringify(data) : String(data);
    throw new Error(message || `Error ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createUser: (payload: { name: string; email: string; password: string; role: "ADMIN" | "WORKER" | "CLIENT" }) =>
    request("/auth/create-user", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Services
  async getServices() {
    type SuccessResponse<T> = { success: boolean; message: string; data: T };
    const res = await request<SuccessResponse<unknown> | unknown>("/services");
    const data = res && typeof res === "object" && "data" in res
      ? (res as SuccessResponse<unknown>).data
      : res;
    return Array.isArray(data) ? (data as unknown[]) : [];
  },
  createService: (payload: { name: string; description?: string; price: number; duration?: number }) =>
    request("/services", { method: "POST", body: JSON.stringify(payload) }),
  updateService: (id: number, payload: Record<string, unknown>) =>
    request(`/services/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteService: (id: number) => request(`/services/${id}`, { method: "DELETE" }),

  // Bookings
  createBooking: (payload: { serviceId: number; date: string; time: string; notes?: string }) =>
    request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  async myBookings() {
    type SuccessResponse<T> = { success: boolean; message: string; data: T };
    const res = await request<SuccessResponse<unknown> | unknown>("/bookings/me");
    const data = res && typeof res === "object" && "data" in res
      ? (res as SuccessResponse<unknown>).data
      : res;
    return Array.isArray(data) ? (data as unknown[]) : [];
  },
  async allBookings() {
    type SuccessResponse<T> = { success: boolean; message: string; data: T };
    const res = await request<SuccessResponse<unknown> | unknown>("/bookings");
    const data = res && typeof res === "object" && "data" in res
      ? (res as SuccessResponse<unknown>).data
      : res;
    return Array.isArray(data) ? (data as unknown[]) : [];
  },
  updateBookingStatus: (id: number, status: string) =>
    request(`/bookings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Users (admin)
  async listUsers() {
    type SuccessResponse<T> = { success: boolean; message: string; data: T };
    const res = await request<SuccessResponse<unknown> | unknown>("/users");
    const data = res && typeof res === "object" && "data" in res
      ? (res as SuccessResponse<unknown>).data
      : res;
    return Array.isArray(data) ? (data as unknown[]) : [];
  },
  updateUserStatus: (id: number, active: boolean) =>
    request(`/users/${id}/status`, { method: "PUT", body: JSON.stringify({ active }) }),
};

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  try {
    window.dispatchEvent(new Event("auth_token_change"));
  } catch {}
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  try {
    window.dispatchEvent(new Event("auth_token_change"));
  } catch {}
}
