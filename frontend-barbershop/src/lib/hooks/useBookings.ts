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
      toast.success("Reserva cancelada exitosamente");
      await loadBookings();
    } catch (err: unknown) {
      let message = "No se pudo cancelar la reserva";
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        
        if (errorMsg.includes('not authorized') || errorMsg.includes('no autorizado')) {
          message = "No tienes autorización para cancelar esta reserva. Solo puedes cancelar tus propias reservas.";
        } else if (errorMsg.includes('403')) {
          message = "No tienes permisos para cancelar esta reserva.";
        } else if (errorMsg.includes('404')) {
          message = "La reserva no existe o ya fue eliminada.";
        } else if (errorMsg.includes('400')) {
          message = "Esta reserva no puede ser cancelada en este momento.";
        } else if (errorMsg.includes('cannot be cancelled')) {
          message = "Esta reserva no puede ser cancelada porque ya fue confirmada o se encuentra en otro estado.";
        } else {
          message = err.message;
        }
      }
      
      // Mostrar toast sin registrar en console para evitar que se vea como error
      toast.error(message);
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
