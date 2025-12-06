import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { Booking } from "@/lib/hooks/useBookings";

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string;
  statusFilter: string;
  onRefresh: () => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onNewBooking?: () => void;
  isClient?: boolean;
}

export function BookingsList({
  bookings,
  loading,
  error,
  statusFilter,
  onRefresh,
  onCancel,
  onNewBooking,
  isClient = false,
}: BookingsListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  
  const filteredBookings = bookings.filter((b) =>
    statusFilter === "ALL" ? true : b.status === statusFilter
  );

  // Función para verificar si se puede cancelar la reserva
  const canCancelBooking = (bookingDate: string | Date): boolean => {
    if (!isClient) return true; // Trabajadores y admins siempre pueden cancelar
    
    const booking = new Date(bookingDate);
    const today = new Date();
    
    // Normalizar las fechas para comparar solo día, mes, año
    const bookingDay = new Date(booking.getFullYear(), booking.getMonth(), booking.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Permitir cancelación solo si la reserva es de otro día
    return bookingDay.getTime() !== todayDay.getTime();
  };

  const handleCancelClick = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      await onCancel(bookingId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
          <p className="text-white text-lg">Cargando reservas...</p>
        </div>
      )}

      {error && !loading && (
        <Alert className="mb-6 border-red-500/40 bg-red-500/10">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-500">Error al cargar reservas</AlertTitle>
          <AlertDescription className="text-red-300">
            {error}
            <Button
              onClick={onRefresh}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!loading && filteredBookings.length === 0 && !error && (
        <Card className="p-12 bg-gray-dark border border-gray-light/20 text-center">
          <Calendar className="w-16 h-16 text-gold/50 mx-auto mb-4" />
          <h3 className="text-white text-xl mb-2">No tienes reservas aún</h3>
          <p className="text-gray-400 mb-6">Comienza reservando tu primer servicio de barbería</p>
          {onNewBooking && (
            <Button onClick={onNewBooking} className="bg-gold text-dark hover:bg-gold/90">
              Hacer mi primera reserva
            </Button>
          )}
        </Card>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="h-[calc(100%-80px)] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gold/30 scrollbar-track-gray-dark/20">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="p-4 bg-gray-dark border border-gray-light/20 flex-shrink-0">
              <div className="space-y-2">
                <div>
                  <h4 className="text-white text-sm font-semibold mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                  <p className="text-gray-400 text-xs">{new Date(b.date).toLocaleString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</p>
                </div>
                {(b.worker || b.notes) && (
                  <p className="text-xs text-gray-300">
                    Barbero: <span className="text-gold font-semibold">{b.worker?.name || b.notes}</span>
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  {b.service?.price != null && (
                    <p className="text-gold text-sm font-bold">S/ {Number(b.service.price).toFixed(2)}</p>
                  )}
                  <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold">
                    {b.status}
                  </span>
                </div>
                {b.status !== "CANCELLED" && (
                  <Button
                    onClick={() => handleCancelClick(b.id)}
                    disabled={!canCancelBooking(b.date) || cancellingId === b.id}
                    title={!canCancelBooking(b.date) ? "No puedes cancelar reservas del mismo día" : "Cancelar reserva"}
                    className={`w-full text-xs py-2 mt-2 ${
                      !canCancelBooking(b.date) || cancellingId === b.id
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                    size="sm"
                  >
                    {cancellingId === b.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin inline" />
                        Cancelando...
                      </>
                    ) : (
                      "Cancelar"
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
