"use client";

// Stub de Toaster y toast sin dependencias externas
type ToasterProps = {
  theme?: "light" | "dark" | "system";
  className?: string;
};

const Toaster = (_props: ToasterProps) => null;

type ToastFn = (message: string) => void;
export const toast: { success: ToastFn; error: ToastFn; info: ToastFn } = {
  success: (_message) => {},
  error: (_message) => {},
  info: (_message) => {},
};

export { Toaster };
