import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calendar, Loader2, RefreshCw } from "lucide-react";
import type { Booking } from "@/lib/hooks/useBookings";

interface BookingsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string;
  statusFilter: string;
  onRefresh: () => Promise<void>;
  onCancel: (id: number) => Promise<void>;
  onNewBooking?: () => void;
}

export function BookingsList({
  bookings,
  loading,
  error,
  statusFilter,
  onRefresh,
  onCancel,
  onNewBooking,
}: BookingsListProps) {
  const filteredBookings = bookings.filter((b) =>
    statusFilter === "ALL" ? true : b.status === statusFilter
  );

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
        <div className="flex flex-col gap-4">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="p-4 bg-gray-dark border border-gray-light/20">
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
                    onClick={() => onCancel(b.id)}
                    className="bg-red-600 hover:bg-red-700 text-white w-full text-xs py-2 mt-2"
                    size="sm"
                  >
                    Cancelar
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
