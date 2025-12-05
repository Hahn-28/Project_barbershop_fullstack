"use client";

import { useSyncExternalStore } from "react";

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("auth_token");
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  // On the server, we don't have access to localStorage
  return false;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onChange = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (e.key === "auth_token") onChange();
  };

  // Custom event fired by saveToken/clearToken (same-tab updates)
  window.addEventListener("auth_token_change", onChange);
  // Storage event (cross-tab updates)
  window.addEventListener("storage", onStorage);
  // Visibility change to catch external changes when tab regains focus
  const onVisibility = () => onChange();
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    window.removeEventListener("auth_token_change", onChange);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export function useAuthToken(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
