import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getNameFromToken, getRoleFromToken } from "@/lib/auth";
import { useWorkerBookings } from "@/lib/hooks/useWorkerBookings";
import { PersonalCalendar } from "@/components/PersonalCalendar";
import type { EventInput } from "@fullcalendar/core";

interface WorkerDashboardProps {
  onLogout: () => void;
}

export function WorkerDashboard({ onLogout }: WorkerDashboardProps) {
  const { bookings, loading, error, loadWorkerBookings, confirmBooking, cancelBooking } = useWorkerBookings();
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadWorkerBookings();
  }, [loadWorkerBookings]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 bg-gradient-to-r from-dark via-gray-900 to-dark/90 border border-gold/30 rounded-lg p-4 shadow-gold/10">
          <div>
            <h2 className="text-gold text-2xl font-extrabold mb-1 drop-shadow">Panel de Trabajador</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="text-white text-base font-semibold truncate max-w-[180px]">{userName}</span>
              <span className="text-xs text-gray-300 italic bg-gold/10 px-2 py-1 rounded">{userRole}</span>
            </div>
          </div>
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg border-2 border-red-400/60 shadow-lg transition-all">
            Cerrar sesión
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
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
            <Button onClick={loadWorkerBookings} className="bg-gold text-dark hover:bg-gold/90">
              <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna izquierda: Lista de reservas (tarjetas) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
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
              <div className="flex flex-col gap-4">
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
                        {b.status !== "CANCELLED" && (
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

          {/* Columna derecha: Calendario personal */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <PersonalCalendar 
              bookings={calendarEvents} 
              title="Mis Reservas Asignadas"
            />
          </div>
        </div>
      </div>
    </>
  );
}
