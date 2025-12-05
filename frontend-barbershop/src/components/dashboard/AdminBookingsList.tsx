import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import type { Booking } from "@/lib/hooks/useAdminBookings";

interface AdminBookingsListProps {
  bookings: Booking[];
  loading: boolean;
  error: string;
  statusFilter: string;
  onRefresh: () => Promise<void>;
  onConfirm: (id: number) => Promise<void>;
  onCancel: (id: number) => Promise<void>;
}

export function AdminBookingsList({
  bookings,
  loading,
  error,
  statusFilter,
  onRefresh,
  onConfirm,
  onCancel,
}: AdminBookingsListProps) {
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
        <Card className="p-8 bg-gray-dark border border-gray-light/20 text-center">
          <p className="text-gray-300">No hay reservas con este estado</p>
        </Card>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <Card key={b.id} className="p-6 bg-gray-dark border border-gray-light/20">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-white mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                  <p className="text-gray-400">{new Date(b.date).toLocaleString()}</p>
                  {b.user && (
                    <p className="text-sm text-gray-300">Cliente: <span className="text-white font-semibold">{b.user.name}</span> <span className="text-gray-400 text-xs">{b.user.email}</span></p>
                  )}
                  {b.worker && (
                    <p className="text-sm text-gray-300">Barbero: <span className="text-gold">{b.worker.name}</span></p>
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
                {b.status !== "CONFIRMED" && (
                  <Button
                    onClick={() => onConfirm(b.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Confirmar
                  </Button>
                )}
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
