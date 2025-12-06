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
      // Recargar las reservas después de actualizar
      await loadWorkerBookings();
    } catch (err: unknown) {
      let message = "No se pudo actualizar la reserva";
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        
        if (errorMsg.includes('not authorized') || errorMsg.includes('no autorizado')) {
          message = "No tienes autorización para modificar esta reserva.";
        } else if (errorMsg.includes('403')) {
          message = "No tienes permisos para modificar esta reserva.";
        } else if (errorMsg.includes('404')) {
          message = "La reserva no existe o ya fue eliminada.";
        } else if (errorMsg.includes('400')) {
          message = "Esta reserva no puede ser modificada en este momento.";
        } else {
          message = err.message;
        }
      }
      
      toast.error(message);
    }
  }, [loadWorkerBookings]);

  const confirmBooking = useCallback((id: number) => {
    updateBookingStatus(id, "CONFIRMED", "Reserva confirmada");
  }, [updateBookingStatus]);
  
  const cancelBooking = useCallback((id: number) => {
    updateBookingStatus(id, "CANCELLED", "Reserva rechazada");
  }, [updateBookingStatus]);

  const completeBooking = useCallback((id: number) => {
    updateBookingStatus(id, "COMPLETE", "Reserva completada");
  }, [updateBookingStatus]);

  return {
    bookings,
    loading,
    error,
    loadWorkerBookings,
    confirmBooking,
    cancelBooking,
    completeBooking,
  };
}
