import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export type User = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'WORKER' | 'CLIENT';
  isActive?: boolean;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  specialties?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      if (err.message.includes('500')) {
        return "Error del servidor. Por favor, intenta más tarde.";
      } else if (err.message.includes('Failed to fetch')) {
        return "No se pudo conectar al servidor. Verifica tu conexión.";
      } else if (err.message.includes('403')) {
        return "No tienes permisos para ver los usuarios.";
      } else if (err.message.includes('401')) {
        return "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      }
      return err.message;
    }
    return "No se pudieron cargar los usuarios";
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const items = (await api.listUsers()) as User[];
      setUsers(items || []);
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error loading users:", err);
      setError(message);
      setUsers([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (id: number, isActive: boolean) => {
    try {
      await api.updateUserStatus(id, isActive);
      setUsers(users.map(u => u.id === id ? { ...u, isActive } : u));
      toast.success(isActive ? "Usuario activado" : "Usuario desactivado");
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error updating user status:", err);
      toast.error(message);
    }
  }, [users]);

  const updateUser = useCallback(async (id: number, data: Record<string, unknown>) => {
    try {
      const updatedUser = await api.updateUser(id, data) as User;
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      toast.success("Usuario actualizado correctamente");
      return true;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error updating user:", err);
      toast.error(message);
      return false;
    }
  }, [users]);

  const deleteUser = useCallback(async (id: number) => {
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success("Usuario eliminado correctamente");
      return true;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error deleting user:", err);
      toast.error(message);
      return false;
    }
  }, [users]);

  const getUserById = useCallback(async (id: number) => {
    try {
      const user = await api.getUserById(id) as User;
      return user;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error getting user:", err);
      toast.error(message);
      return null;
    }
  }, []);

  const getUserBookingHistory = useCallback(async (id: number) => {
    try {
      const bookings = await api.getUserBookingHistory(id);
      return bookings;
    } catch (err: unknown) {
      const message = handleError(err);
      console.error("Error getting user booking history:", err);
      toast.error(message);
      return [];
    }
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    updateUserStatus,
    updateUser,
    deleteUser,
    getUserById,
    getUserBookingHistory,
  };
}
