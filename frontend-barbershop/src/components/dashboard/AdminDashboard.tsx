import { useState, useEffect } from "react";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminBookingsList } from "./AdminBookingsList";
import { CreateUserForm } from "./CreateUserForm";
import { useAdminBookings } from "@/lib/hooks/useAdminBookings";
import { useCreateUser } from "@/lib/hooks/useCreateUser";
import { Toaster } from "@/components/ui/sonner";
import { RefreshCw } from "lucide-react";
import type { NewUser } from "@/lib/hooks/useCreateUser";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { bookings, loading, error, loadAllBookings, confirmBooking, cancelBooking } = useAdminBookings();
  const { creating, createUser } = useCreateUser();

  useEffect(() => {
    loadAllBookings();
  }, [loadAllBookings]);

  const handleCreateUser = async (newUser: NewUser) => {
    return await createUser(newUser);
  };

  // Obtener nombre y rol del usuario
  const userName = getNameFromToken();
  const userRole = getRoleFromToken();

  return (
    <>
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-gradient-to-r from-dark via-gray-900 to-dark/90 border border-gold/30 rounded-lg p-4 shadow-gold/10">
          <div>
            <h2 className="text-gold text-2xl font-extrabold mb-1 drop-shadow">Panel de Administración</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="text-white text-base font-semibold truncate max-w-[140px]">{userName}</span>
              <span className="text-xs text-gray-300 italic bg-gold/10 px-2 py-1 rounded">{userRole}</span>
            </div>
          </div>
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg border-2 border-red-400/60 shadow-lg transition-all">
            Cerrar sesión
          </Button>
        </div>

        <CreateUserForm onSubmit={handleCreateUser} isLoading={creating} />

        <div className="flex gap-6 border-b border-gray-light/20 mb-6">
          <button className="py-3 px-2 border-b-2 border-gold text-gold">Reservas</button>
        </div>

        <div className="bg-gray-dark p-6 rounded border border-gray-light/20 mb-8">
          <h3 className="text-white text-xl mb-4">Usuarios</h3>
          <p className="text-gray-400">
            (Requiere endpoint /users para listar y /users/:id/status para activar/desactivar)
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl">Todas las Reservas</h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-dark border border-gray-light/30 text-white px-3 py-2 rounded"
              >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              <Button onClick={loadAllBookings} className="bg-gold text-dark hover:bg-gold/90">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          <AdminBookingsList
            bookings={bookings}
            loading={loading}
            error={error}
            statusFilter={statusFilter}
            onRefresh={loadAllBookings}
            onConfirm={confirmBooking}
            onCancel={cancelBooking}
          />
        </div>
      </div>
    </>
  );
}
