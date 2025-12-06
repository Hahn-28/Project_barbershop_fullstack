import { toast } from '@/components/ui/sonner';
import { api } from '@/lib/api';
import { useCallback, useState } from 'react';

export type Booking = {
  id: number;
  serviceId: number;
  date: string | Date;
  status: string;
  notes?: string;
  service?: { name: string; price?: number };
   worker?: { id: number; name: string; email?: string; phone?: string };
};

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes('500')) {
        return "Error del servidor. Por favor, intenta más tarde.";
      } else if (err.message.includes('Failed to fetch')) {
        return "No se pudo conectar al servidor. Verifica tu conexión.";
      } else if (err.message.includes('403')) {
        return "No tienes permisos para ver estas reservas.";
      } else if (err.message.includes('401')) {
        return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      }
      return err.message;
    }
    return "No se pudieron cargar tus reservas";
  };

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = (await api.myBookings()) as Booking[];
      setBookings(items || []);
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error loading bookings:", err);
      setError(message);
      setBookings([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: number) => {
    try {
      await api.updateBookingStatus(id, "CANCELLED");
      toast.success("Reserva cancelada");
      await loadBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cancelar la reserva";
      console.error("Error cancelling booking:", err);
      toast.error(message);
      throw err;
    }
  }, [loadBookings]);

  const filterBookings = useCallback((statusFilter: string) => {
    return bookings.filter((b) => 
      statusFilter === "ALL" ? true : b.status === statusFilter
    );
  }, [bookings]);

  return {
    bookings,
    loading,
    error,
    loadBookings,
    cancelBooking,
    filterBookings,
  };
}
