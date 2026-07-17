import { useAuthStore } from "@/store/auth";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000";

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

export interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  _retry?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (inMemoryAccessToken) {
    headers["Authorization"] = `Bearer ${inMemoryAccessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(url, config);

  if (response.status === 401 && !options._retry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/signup")) {
    if (isRefreshing) {
      try {
        const token = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers["Authorization"] = `Bearer ${token}`;
        return apiClient<T>(endpoint, { ...options, headers, _retry: true });
      } catch (err) {
        throw err;
      }
    }

    options._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${BASE_URL.replace(/\/$/, "")}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new Error("Refresh failed");
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData.access_token;
      setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);
      isRefreshing = false;

      headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(url, { ...config, headers });
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      isRefreshing = false;
      setAccessToken(null);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw refreshErr;
    }
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
