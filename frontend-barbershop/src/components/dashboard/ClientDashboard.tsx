import { useState, useEffect } from "react";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BookingModule } from "@/components/BookingModule";
import { BookingsList } from "./BookingsList";
import { useBookings } from "@/lib/hooks/useBookings";
import { Toaster } from "@/components/ui/sonner";

interface ClientDashboardProps {
  readonly onLogout: () => void;
}

export function ClientDashboard({ onLogout }: ClientDashboardProps) {
  const [activeView, setActiveView] = useState<"bookings" | "new">("bookings");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { bookings, loading, error, loadBookings, cancelBooking } = useBookings();

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Obtener nombre y rol del usuario
  const userName = getNameFromToken();
  const userRole = getRoleFromToken();

  return (
    <>
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 bg-gradient-to-r from-dark via-gray-900 to-dark/90 border border-gold/30 rounded-lg p-4 shadow-gold/10">
          <div>
            <h2 className="text-gold text-2xl font-extrabold mb-1 drop-shadow">Panel de Cliente</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="text-white text-base font-semibold truncate max-w-[140px]">{userName}</span>
              <span className="text-xs text-gray-300 italic bg-gold/10 px-2 py-1 rounded">{userRole}</span>
            </div>
          </div>
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg border-2 border-red-400/60 shadow-lg transition-all">
            Cerrar sesión
          </Button>
        </div>

        <div className="flex gap-6 border-b border-gray-light/20 mb-6">
          <button
            onClick={() => setActiveView("bookings")}
            className={`py-3 px-2 border-b-2 ${
              activeView === "bookings"
                ? "border-gold text-gold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => setActiveView("new")}
            className={`py-3 px-2 border-b-2 ${
              activeView === "new"
                ? "border-gold text-gold"
                : "border-transparent text-gray-400 hover:text-white"
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
                <Button onClick={loadBookings} className="bg-gold text-dark hover:bg-gold/90">
                  Actualizar
                </Button>
              </div>
            </div>

            <BookingsList
              bookings={bookings}
              loading={loading}
              error={error}
              statusFilter={statusFilter}
              onRefresh={loadBookings}
              onCancel={cancelBooking}
              onNewBooking={() => setActiveView("new")}
            />
          </div>
        )}

        {activeView === "new" && (
          <BookingModule
            onBookingComplete={() => {
              setActiveView("bookings");
              loadBookings();
            }}
          />
        )}
      </div>
    </>
  );
}
