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
  user?: { id: number; name: string; email?: string; phone?: string };
  worker?: { id: number; name: string; email?: string; phone?: string };
};

export function useWorkerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes('500')) return "Error del servidor. Por favor, intenta más tarde.";
      if (err.message.includes('Failed to fetch')) return "No se pudo conectar al servidor. Verifica tu conexión.";
      if (err.message.includes('403')) return "No tienes permisos para ver estas reservas.";
      if (err.message.includes('401')) return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      return err.message;
    }
    return "No se pudieron cargar las reservas";
  };

  const loadWorkerBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = (await api.workerBookings()) as Booking[];
      setBookings(items || []);
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error loading worker bookings:", err);
      setError(message);
      setBookings([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = useCallback(async (id: number, status: string, successMessage?: string) => {
    try {
      await api.updateBookingStatus(id, status);
      toast.success(successMessage || `Reserva ${status.toLowerCase()}`);
      await loadWorkerBookings();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar la reserva";
      toast.error(message);
    }
  }, [loadWorkerBookings]);

  const confirmBooking = useCallback((id: number) => updateBookingStatus(id, "CONFIRMED", "Reserva confirmada"), [updateBookingStatus]);
  const cancelBooking = useCallback((id: number) => updateBookingStatus(id, "CANCELLED", "Reserva cancelada"), [updateBookingStatus]);

  return {
    bookings,
    loading,
    error,
    loadWorkerBookings,
    confirmBooking,
    cancelBooking,
  };
}
