import { useState, useEffect, useMemo } from "react";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BookingModule } from "@/components/BookingModule";
import { BookingsList } from "./BookingsList";
import { ProfileCard } from "./ProfileCard";
import { useBookings } from "@/lib/hooks/useBookings";
import { Toaster } from "@/components/ui/sonner";
import { PersonalCalendar } from "@/components/PersonalCalendar";
import type { EventInput } from "@fullcalendar/core";

interface ClientDashboardProps {
  readonly onLogout: () => void;
}

export function ClientDashboard({ onLogout }: ClientDashboardProps) {
  const [activeView, setActiveView] = useState<"bookings" | "new" | "profile">("bookings");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { bookings, loading, error, loadBookings, cancelBooking } = useBookings();

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Obtener nombre y rol del usuario
  const userName = getNameFromToken();
  const userRole = getRoleFromToken();

  // Convertir reservas a eventos de calendario
  const calendarEvents: EventInput[] = useMemo(() => {
    return bookings.map(b => {
      // Usar la fecha tal como viene del backend
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toISOString();
      const startDate = new Date(bookingDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      return {
        id: String(b.id),
        title: b.service?.name || 'Reserva',
        start: bookingDate,
        end: endDate.toISOString(),
        allDay: false, // Importante: especificar que NO es evento de todo el día
        extendedProps: {
          status: b.status,
          workerName: b.worker?.name,
        }
      };
    });
  }, [bookings]);

  // Renderizar contenido basado en la vista activa
  const renderContent = () => {
    if (activeView === "bookings") {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Columna izquierda: Contenido principal (tarjetas) */}
          <div className="order-2 lg:order-1 h-[700px]">
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-4 shadow-xl h-full flex flex-col">
              <div className="space-y-3 mb-4 flex-shrink-0">
                <h3 className="text-white text-base font-bold">Mis Reservas</h3>
                <div className="space-y-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-medium/80 backdrop-blur border border-gray-light/20 text-white px-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-gold/50 transition"
                  >
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="COMPLETE">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                  <Button onClick={loadBookings} className="bg-gold text-dark hover:bg-gold/90 w-full rounded-lg shadow-lg hover:shadow-gold/30 transition-all py-2 text-sm">
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
                isClient={true}
              />
            </div>
          </div>

          {/* Columna derecha: Calendario personal */}
          <div className="order-1 lg:order-2 h-[700px]">
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl h-full">
              <PersonalCalendar 
                bookings={calendarEvents} 
                title="Mis Citas"
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeView === "profile") {
      return (
        <ProfileCard
          onLogout={onLogout}
          role={userRole || "CLIENT"}
          bookingStats={{
            confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
            pending: bookings.filter(b => b.status === "PENDING").length,
            complete: bookings.filter(b => b.status === "COMPLETE").length,
            cancelled: bookings.filter(b => b.status === "CANCELLED").length,
            total: bookings.length,
          }}
        />
      );
    }

    return (
      <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-8 shadow-xl">
        <BookingModule
          onBookingComplete={() => {
            setActiveView("bookings");
            loadBookings();
          }}
        />
      </div>
    );
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-dark/95 via-gray-900/95 to-gray-dark/95 backdrop-blur-xl border-b border-gold/20 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-gold text-3xl font-bold drop-shadow-lg">Panel de Cliente</h1>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium truncate max-w-[200px]">{userName}</span>
                  <span className="text-xs text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30">{userRole}</span>
                </div>
              </div>
              <Button onClick={onLogout} className="bg-red-600/90 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl border border-red-500/30 shadow-lg hover:shadow-red-500/20 transition-all">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-2 border-b border-gray-light/15 mb-8">
            <button
              onClick={() => setActiveView("bookings")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all rounded-t-lg ${
                activeView === "bookings"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Mis Reservas
            </button>
            <button
              onClick={() => setActiveView("new")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all rounded-t-lg ${
                activeView === "new"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Nueva Reserva
            </button>
            <button
              onClick={() => setActiveView("profile")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all rounded-t-lg ${
                activeView === "profile"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Mi Perfil
            </button>
          </div>

          {activeView === "bookings" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
              {/* Columna izquierda: Contenido principal (tarjetas) */}
              <div className="order-2 lg:order-1 h-[700px]">
                <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-4 shadow-xl h-full flex flex-col">
                  <div className="space-y-3 mb-4 flex-shrink-0">
                    <h3 className="text-white text-base font-bold">Mis Reservas</h3>
                    <div className="space-y-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-medium/80 backdrop-blur border border-gray-light/20 text-white px-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-gold/50 transition"
                      >
                        <option value="ALL">Todos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="CONFIRMED">Confirmada</option>
                        <option value="COMPLETE">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                      </select>
                      <Button onClick={loadBookings} className="bg-gold text-dark hover:bg-gold/90 w-full rounded-lg shadow-lg hover:shadow-gold/30 transition-all py-2 text-sm">
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
                    isClient={true}
                  />
                </div>
              </div>

              {/* Columna derecha: Calendario personal */}
              <div className="order-1 lg:order-2 h-[700px]">
                <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl h-full">
                  <PersonalCalendar 
                    bookings={calendarEvents} 
                    title="Mis Citas"
                  />
                </div>
              </div>
            </div>
          ) : activeView === "profile" ? (
            <ProfileCard
              onLogout={onLogout}
              role={userRole || "CLIENT"}
              bookingStats={{
                confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
                pending: bookings.filter(b => b.status === "PENDING").length,
                complete: bookings.filter(b => b.status === "COMPLETE").length,
                cancelled: bookings.filter(b => b.status === "CANCELLED").length,
                total: bookings.length,
              }}
            />
          ) : (
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-8 shadow-xl">
              <BookingModule
                onBookingComplete={() => {
                  setActiveView("bookings");
                  loadBookings();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
