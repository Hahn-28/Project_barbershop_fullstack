"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveToken } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token) {
      saveToken(token);
      
      // Opcional: guardar info del usuario
      if (userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

      // Redirigir al dashboard
      router.replace("/dashboard");
    } else {
      // Si no hay token, redirigir al login
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Autenticando...</p>
      </div>
    </div>
  );
}
