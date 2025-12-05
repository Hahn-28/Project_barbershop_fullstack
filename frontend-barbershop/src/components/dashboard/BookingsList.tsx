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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="p-6 bg-gray-dark border border-gray-light/20">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                  <p className="text-gray-400">{new Date(b.date).toLocaleString()}</p>
                  {(b.worker || b.notes) && (
                    <p className="text-sm text-gray-300 mt-2">
                      Barbero: <span className="text-gold">{b.worker?.name || b.notes}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {b.service?.price != null && (
                    <p className="text-gold mb-2">S/ {Number(b.service.price).toFixed(2)}</p>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm bg-gold/10 text-gold">
                    {b.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                {b.status !== "CANCELLED" && (
                  <Button
                    onClick={() => onCancel(b.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
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
