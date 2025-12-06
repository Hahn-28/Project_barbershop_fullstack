import { useState, useCallback } from 'react';
import { api } from '../api';
import { toast } from 'sonner';

interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    workers: number;
    clients: number;
  };
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  services: {
    total: number;
  };
}

interface BookingStats {
  total: number;
  byStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  byPeriod: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface ServiceStats {
  totalServices: number;
  totalBookings: number;
  mostPopular: {
    id: number;
    name: string;
    bookingsCount: number;
  } | null;
  services: Array<{
    id: number;
    name: string;
    price: number;
    bookingsCount: number;
  }>;
}

export function useAdminStats() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSystemStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getSystemStats();
      setSystemStats(data as SystemStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas del sistema';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBookingStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getBookingStats();
      setBookingStats(data as BookingStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas de reservas';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadServiceStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getServiceStats();
      setServiceStats(data as ServiceStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas de servicios';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    systemStats,
    bookingStats,
    serviceStats,
    loading,
    error,
    loadSystemStats,
    loadBookingStats,
    loadServiceStats,
  };
}
