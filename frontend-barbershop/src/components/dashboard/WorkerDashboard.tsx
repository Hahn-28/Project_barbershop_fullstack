import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getNameFromToken, getRoleFromToken } from "@/lib/auth";
import { useWorkerBookings } from "@/lib/hooks/useWorkerBookings";
import { ProfileCard } from "./ProfileCard";
import { PersonalCalendar } from "@/components/PersonalCalendar";
import type { EventInput } from "@fullcalendar/core";

interface WorkerDashboardProps {
  onLogout: () => void;
}

export function WorkerDashboard({ onLogout }: WorkerDashboardProps) {
  const { bookings, loading, error, loadWorkerBookings, confirmBooking, cancelBooking, completeBooking } = useWorkerBookings();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeView, setActiveView] = useState<"bookings" | "profile">("bookings");

  useEffect(() => {
    loadWorkerBookings();
  }, [loadWorkerBookings]);

  // Función para verificar si una reserva puede ser completada
  const canCompleteBooking = (bookingDate: string | Date) => {
    const now = new Date();
    const booking = new Date(bookingDate);
    // Puede completar si ya pasó la hora de la reserva
    return now >= booking;
  };

  const filtered = bookings.filter(b => statusFilter === "ALL" ? true : b.status === statusFilter);
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
          clientName: b.user?.name,
        }
      };
    });
  }, [bookings]);

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-dark/95 via-gray-900/95 to-gray-dark/95 backdrop-blur-xl border-b border-gold/20 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-gold text-3xl font-bold drop-shadow-lg">Panel de Trabajador</h1>
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
          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-light/10 pb-0">
            <button
              onClick={() => setActiveView("bookings")}
              className={`pb-4 px-1 font-semibold transition-all ${
                activeView === "bookings"
                  ? "text-gold border-b-2 border-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mis Reservas
            </button>
            <button
              onClick={() => setActiveView("profile")}
              className={`pb-4 px-1 font-semibold transition-all ${
                activeView === "profile"
                  ? "text-gold border-b-2 border-gold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mi Perfil
            </button>
          </div>

          {/* Profile View */}
          {activeView === "profile" && (
            <ProfileCard
              onLogout={onLogout}
              role={userRole || "WORKER"}
              bookingStats={{
                confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
                pending: bookings.filter(b => b.status === "PENDING").length,
                complete: bookings.filter(b => b.status === "COMPLETE").length,
                cancelled: bookings.filter(b => b.status === "CANCELLED").length,
                total: bookings.length,
              }}
            />
          )}

          {/* Bookings View */}
          {activeView === "bookings" && (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-white text-2xl font-bold">Mis Reservas Asignadas</h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-medium/80 backdrop-blur border border-gray-light/20 text-white px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-gold/50 transition flex-1 sm:flex-none"
                  >
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="COMPLETE">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                  <Button onClick={loadWorkerBookings} className="bg-gold text-dark hover:bg-gold/90 rounded-lg shadow-lg hover:shadow-gold/30 transition-all">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                  </Button>
                </div>
              </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
            {/* Columna izquierda: Lista de reservas (tarjetas) */}
            <div className="order-2 lg:order-1 h-[700px]">
              <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-4 shadow-xl h-full flex flex-col">
                {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                <p className="text-white text-sm">Cargando...</p>
              </div>
            )}

            {error && !loading && (
              <Alert className="mb-6 border-red-500/40 bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-500 text-sm">Error</AlertTitle>
                <AlertDescription className="text-red-300 text-xs">
                  {error}
                  <Button onClick={loadWorkerBookings} className="mt-2 bg-red-600 hover:bg-red-700 text-white w-full" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!loading && filtered.length === 0 && !error && (
              <Card className="p-6 bg-gray-dark border border-gray-light/20 text-center">
                <p className="text-gray-300 text-sm">No hay reservas con este estado</p>
              </Card>
            )}

            {!loading && filtered.length > 0 && (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-gray-dark/20">
                {filtered.map((b) => (
                  <Card key={b.id} className="p-4 bg-gray-dark border border-gray-light/20">
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-white text-sm font-semibold mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                        <p className="text-gray-400 text-xs">{new Date(b.date).toLocaleString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</p>
                      </div>
                      {b.user && (
                        <p className="text-xs text-gray-300">
                          <span className="text-white font-semibold">{b.user.name}</span>
                          <br />
                          <span className="text-gray-400">{b.user.email}</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {b.service?.price != null && (
                          <p className="text-gold text-sm font-bold">S/ {Number(b.service.price).toFixed(2)}</p>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold">{b.status}</span>
                      </div>
                      <div className="flex flex-col gap-2 mt-3">
                        {b.status !== "CONFIRMED" && (
                          <Button onClick={() => confirmBooking(b.id)} className="bg-green-600 hover:bg-green-700 text-white w-full text-xs py-1" size="sm">
                            Confirmar
                          </Button>
                        )}
                        {b.status === "CONFIRMED" && canCompleteBooking(b.date) && (
                          <Button onClick={() => completeBooking(b.id)} className="bg-blue-600 hover:bg-blue-700 text-white w-full text-xs py-1" size="sm">
                            Completar
                          </Button>
                        )}
                        {b.status !== "CANCELLED" && b.status !== "COMPLETE" && (
                          <Button onClick={() => cancelBooking(b.id)} className="bg-red-600 hover:bg-red-700 text-white w-full text-xs py-1" size="sm">
                            Rechazar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
              </div>
            </div>

            {/* Columna derecha: Calendario personal */}
            <div className="order-1 lg:order-2 h-[700px]">
              <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl h-full">
                <PersonalCalendar 
                  bookings={calendarEvents} 
                  title="Mis Reservas Asignadas"
                />
              </div>
            </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
