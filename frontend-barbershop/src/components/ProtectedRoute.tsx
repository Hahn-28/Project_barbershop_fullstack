"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthToken } from "@/lib/useAuthToken";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const hasToken = useAuthToken();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hasToken) {
      router.replace("/auth/login");
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [hasToken, router]);

  if (authorized === null) {
    return <div className="container mx-auto py-8">Cargando...</div>;
  }

  if (!authorized) return null;

  return <>{children}</>;
}
