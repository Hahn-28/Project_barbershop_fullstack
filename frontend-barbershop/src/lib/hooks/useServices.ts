import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number;
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes('500')) {
        return "Error del servidor. Por favor, intenta más tarde.";
      } else if (err.message.includes('Failed to fetch')) {
        return "No se pudo conectar al servidor. Verifica tu conexión.";
      } else if (err.message.includes('403')) {
        return "No tienes permisos para ver los servicios.";
      } else if (err.message.includes('401')) {
        return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      }
      return err.message;
    }
    return "No se pudieron cargar los servicios";
  };

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = (await api.getServices()) as Service[];
      setServices(items || []);
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error loading services:", err);
      setError(message);
      setServices([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: { name: string; description?: string; price: number; duration?: number }) => {
    setError("");
    try {
      const newService = (await api.createService(data)) as Service;
      setServices([...services, newService]);
      toast.success("Servicio creado exitosamente");
      return true;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error creating service:", err);
      setError(message);
      toast.error(message);
      return false;
    }
  }, [services]);

  const updateService = useCallback(async (id: number, data: { name?: string; description?: string; price?: number; duration?: number }) => {
    setError("");
    try {
      const updated = (await api.updateService(id, data)) as Service;
      setServices(services.map(s => s.id === id ? updated : s));
      toast.success("Servicio actualizado exitosamente");
      return true;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error updating service:", err);
      setError(message);
      toast.error(message);
      return false;
    }
  }, [services]);

  const deleteService = useCallback(async (id: number) => {
    setError("");
    try {
      await api.deleteService(id);
      setServices(services.filter(s => s.id !== id));
      toast.success("Servicio eliminado exitosamente");
      return true;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error deleting service:", err);
      setError(message);
      toast.error(message);
      return false;
    }
  }, [services]);

  return {
    services,
    loading,
    error,
    loadServices,
    createService,
    updateService,
    deleteService,
  };
}
