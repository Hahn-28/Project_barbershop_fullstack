"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { clearToken } from "@/lib/api";
import { getRoleFromToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { WorkerDashboard } from "@/components/dashboard/WorkerDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("CLIENT");

  useEffect(() => {
    setRole(getRoleFromToken("CLIENT"));
  }, []);

  function handleLogout() {
    try {
      clearToken();
    } finally {
      router.replace("/auth/login");
    }
  }

  if (role === "ADMIN") {
    return (
      <ProtectedRoute>
        <AdminDashboard onLogout={handleLogout} />
      </ProtectedRoute>
    );
  }

  if (role === "WORKER") {
    return (
      <ProtectedRoute>
        <WorkerDashboard onLogout={handleLogout} />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ClientDashboard onLogout={handleLogout} />
    </ProtectedRoute>
  );
}
