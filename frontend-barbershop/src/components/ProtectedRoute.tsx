"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!token) {
        router.replace("/auth/login");
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    } catch (err) {
      router.replace("/auth/login");
      setAuthorized(false);
    }
  }, [router]);

  if (authorized === null) {
    return <div className="container mx-auto py-8">Cargando...</div>;
  }

  if (!authorized) return null;

  return <>{children}</>;
}
