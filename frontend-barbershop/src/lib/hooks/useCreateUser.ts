import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export type NewUser = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "WORKER" | "CLIENT";
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  specialties?: string;
};

export function useCreateUser() {
  const [creating, setCreating] = useState(false);

  const createUser = useCallback(async (newUser: NewUser) => {
    setCreating(true);
    try {
      await api.createUser(newUser);
      toast.success("Usuario creado exitosamente");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo crear el usuario";
      toast.error(message);
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  return {
    creating,
    createUser,
  };
}
