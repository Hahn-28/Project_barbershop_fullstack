"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { api, clearToken } from "@/lib/api";
import { getRoleFromToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingModule } from "@/components/BookingModule";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster, toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

type Booking = {
  id: number;
  serviceId: number;
  date: string;
  status: string;
  notes?: string;
  service?: { name: string; price?: number };
};

export default function DashboardPage() {
  const router = useRouter();
  // Detect role from JWT stored in localStorage
  const [role, setRole] = useState<string>("CLIENT");
  const [activeView, setActiveView] = useState<"bookings" | "new">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: "ADMIN" | "WORKER" | "CLIENT" }>({ name: "", email: "", password: "", role: "WORKER" });

  function handleLogout() {
    try {
      clearToken();
      toast.success("Sesión cerrada");
    } finally {
      router.replace("/auth/login");
    }
  }

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const isAdmin = getRoleFromToken("CLIENT") === "ADMIN";
      const items = isAdmin ? (await api.allBookings()) as Booking[] : (await api.myBookings()) as Booking[];
      setBookings(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar tus reservas";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id: number) {
    try {
      await api.updateBookingStatus(id, "CANCELLED");
      toast.success("Reserva cancelada");
      loadBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cancelar la reserva";
      toast.error(message);
    }
  }

  useEffect(() => {
    setRole(getRoleFromToken("CLIENT"));
    loadBookings();
  }, []);

  // If admin, render admin dashboard
  if (role === "ADMIN") {
    return (
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Toaster />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl">Panel de Administración</h2>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Cerrar sesión</Button>
          </div>
          <div className="bg-gray-dark p-6 rounded border border-gray-light/20 mb-8">
            <h3 className="text-white text-xl mb-4">Crear usuario Worker</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white"
                placeholder="Nombre"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white"
                placeholder="Correo"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white"
                placeholder="Contraseña"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "ADMIN" | "WORKER" | "CLIENT" })}
              >
                <option value="WORKER">WORKER</option>
                <option value="CLIENT">CLIENT</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="mt-4">
              <Button
                className="bg-gold text-dark hover:bg-gold/90"
                disabled={creatingUser}
                onClick={async () => {
                  setCreatingUser(true);
                  try {
                    await api.createUser(newUser);
                    toast.success("Usuario WORKER creado");
                    setNewUser({ name: "", email: "", password: "", role: "WORKER" });
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "No se pudo crear el usuario";
                    toast.error(message);
                  } finally {
                    setCreatingUser(false);
                  }
                }}
              >
                {creatingUser ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </div>
          <div className="flex gap-6 border-b border-gray-light/20 mb-6">
            <button className="py-3 px-2 border-b-2 border-gold text-gold">Reservas</button>
          </div>
          {/* Admin: listado de usuarios y reservas */}
          <div className="bg-gray-dark p-6 rounded border border-gray-light/20 mb-8">
            <h3 className="text-white text-xl mb-4">Usuarios</h3>
            <p className="text-gray-400">(Requiere endpoint /users para listar y /users/:id/status para activar/desactivar)</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl">Todas las Reservas</h2>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-dark border border-gray-light/30 text-white px-3 py-2 rounded"
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
                <Button onClick={loadBookings} className="bg-gold text-dark hover:bg-gold/90">Actualizar</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings
                .filter((b) => statusFilter === "ALL" ? true : b.status === statusFilter)
                .map((b) => (
                <Card key={b.id} className="p-6 bg-gray-dark border border-gray-light/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                      <p className="text-gray-400">{new Date(b.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {b.service?.price != null && (
                        <p className="text-gold mb-2">S/ {Number(b.service.price).toFixed(2)}</p>
                      )}
                      <span className="px-3 py-1 rounded-full text-sm bg-gold/10 text-gold">{b.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    {b.status !== "CONFIRMED" && (
                      <Button onClick={() => api.updateBookingStatus(b.id, "CONFIRMED").then(() => { toast.success("Reserva confirmada"); loadBookings(); }).catch((e) => toast.error(e instanceof Error ? e.message : "Error al confirmar"))} className="bg-green-600 hover:bg-green-700 text-white">Confirmar</Button>
                    )}
                    {b.status !== "CANCELLED" && (
                      <Button onClick={() => api.updateBookingStatus(b.id, "CANCELLED").then(() => { toast.success("Reserva cancelada"); loadBookings(); }).catch((e) => toast.error(e instanceof Error ? e.message : "Error al cancelar"))} className="bg-red-600 hover:bg-red-700 text-white">Cancelar</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // CLIENT dashboard
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Toaster />
        <div className="flex items-center justify-end mb-4">
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Cerrar sesión</Button>
        </div>
        <div className="flex gap-6 border-b border-gray-light/20 mb-6">
          <button
            onClick={() => setActiveView("bookings")}
            className={`py-3 px-2 border-b-2 ${
              activeView === "bookings" ? "border-gold text-gold" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => setActiveView("new")}
            className={`py-3 px-2 border-b-2 ${
              activeView === "new" ? "border-gold text-gold" : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Nueva Reserva
          </button>
        </div>

        {activeView === "bookings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl">Mis Reservas</h2>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-dark border border-gray-light/30 text-white px-3 py-2 rounded"
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
                <Button onClick={loadBookings} className="bg-gold text-dark hover:bg-gold/90">Actualizar</Button>
              </div>
            </div>
            {loading && <p className="text-white">Cargando...</p>}
            {error && (
              <Alert className="mb-4 border-red-500/40 bg-red-500/10">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!loading && bookings.length === 0 && !error && (
              <Card className="p-8 bg-gray-dark border border-gray-light/20 text-center">
                <p className="text-gray-300 mb-4">No tienes reservas aún</p>
                <Button onClick={() => setActiveView("new")} className="bg-gold text-dark">Hacer mi primera reserva</Button>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings
                .filter((b) => statusFilter === "ALL" ? true : b.status === statusFilter)
                .map((b) => (
                <Card key={b.id} className="p-6 bg-gray-dark border border-gray-light/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                      <p className="text-gray-400">{new Date(b.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      {b.service?.price != null && (
                        <p className="text-gold mb-2">S/ {Number(b.service.price).toFixed(2)}</p>
                      )}
                      <span className="px-3 py-1 rounded-full text-sm bg-gold/10 text-gold">{b.status}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    {b.status !== "CANCELLED" && (
                      <Button onClick={() => cancelBooking(b.id)} className="bg-red-600 hover:bg-red-700 text-white">Cancelar</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === "new" && (
          <BookingModule onBookingComplete={() => { setActiveView("bookings"); loadBookings(); }} />
        )}
      </div>
    </ProtectedRoute>
  );
}
