import { useState, useEffect } from "react";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AdminBookingsList } from "./AdminBookingsList";
import { CreateWorkerModal } from "./CreateWorkerModal";
import { UsersList } from "./UsersList";
import { ServicesList } from "./ServicesList";
import { useAdminBookings } from "@/lib/hooks/useAdminBookings";
import { useCreateUser } from "@/lib/hooks/useCreateUser";
import { useUsers } from "@/lib/hooks/useUsers";
import { useServices } from "@/lib/hooks/useServices";
import { Toaster } from "@/components/ui/sonner";
import { RefreshCw, Users, Calendar, Plus, Wrench } from "lucide-react";
import type { NewUser } from "@/lib/hooks/useCreateUser";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clientes" | "trabajadores" | "servicios" | "reservas">("dashboard");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const { bookings, loading, error, loadAllBookings, confirmBooking, cancelBooking } = useAdminBookings();
  const { users, loading: usersLoading, error: usersError, loadUsers, updateUserStatus } = useUsers();
  const { services, loading: servicesLoading, error: servicesError, loadServices, createService, updateService, deleteService } = useServices();
  const { creating, createUser } = useCreateUser();

  useEffect(() => {
    loadAllBookings();
    loadUsers();
    loadServices();
  }, [loadAllBookings, loadUsers, loadServices]);

  const handleCreateUser = async (newUser: NewUser) => {
    const result = await createUser(newUser);
    if (result) {
      loadUsers();
    }
    return result;
  };

  const handleCreateWorker = async (data: { name: string; email: string; password: string; bio?: string; specialties?: string }) => {
    const workerData: NewUser = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'WORKER',
      bio: data.bio,
      specialties: data.specialties,
    };
    return await handleCreateUser(workerData);
  };

  // Obtener nombre y rol del usuario
  const userName = getNameFromToken();
  const userRole = getRoleFromToken();

  // Estadísticas
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const workerCount = users.filter(u => u.role === 'WORKER').length;
  const clientCount = users.filter(u => u.role === 'CLIENT').length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-dark">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark via-gray-900 to-dark/90 border-b border-gold/30 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-gold text-3xl font-extrabold drop-shadow">Panel de Administración</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1">
                  <span className="text-white text-base font-semibold truncate">{userName}</span>
                  <span className="text-xs text-gray-300 italic bg-gold/10 px-2 py-1 rounded w-fit">{userRole}</span>
                </div>
              </div>
              <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg border-2 border-red-400/60 shadow-lg transition-all w-full md:w-auto">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-dark border border-gold/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Usuarios</p>
                  <p className="text-gold text-3xl font-bold">{totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-gold/50" />
              </div>
            </div>
            <div className="bg-gray-dark border border-blue-700/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Trabajadores</p>
                  <p className="text-blue-400 text-3xl font-bold">{workerCount}</p>
                </div>
                <div className="w-8 h-8 bg-blue-700/30 rounded-full" />
              </div>
            </div>
            <div className="bg-gray-dark border border-green-700/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Clientes</p>
                  <p className="text-green-400 text-3xl font-bold">{clientCount}</p>
                </div>
                <div className="w-8 h-8 bg-green-700/30 rounded-full" />
              </div>
            </div>
            <div className="bg-gray-dark border border-gold/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Reservas</p>
                  <p className="text-gold text-3xl font-bold">{totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-gold/50" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-light/20 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("clientes")}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "clientes"
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab("trabajadores")}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "trabajadores"
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Trabajadores
            </button>
            <button
              onClick={() => setActiveTab("servicios")}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "servicios"
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveTab("reservas")}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "reservas"
                  ? "border-gold text-gold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Reservas
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-dark border border-gray-light/20 rounded-lg p-6">
                  <h3 className="text-white text-lg font-bold mb-4">Resumen Usuarios</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Administradores</span>
                      <span className="text-red-400 font-bold">{adminCount}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Trabajadores</span>
                      <span className="text-blue-400 font-bold">{workerCount}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Clientes</span>
                      <span className="text-green-400 font-bold">{clientCount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-dark border border-gray-light/20 rounded-lg p-6">
                  <h3 className="text-white text-lg font-bold mb-4">Resumen Reservas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Pendientes</span>
                      <span className="text-yellow-400 font-bold">{pendingBookings}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Confirmadas</span>
                      <span className="text-green-400 font-bold">{confirmedBookings}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-light/20">
                      <span className="text-gray-300">Total</span>
                      <span className="text-gold font-bold">{totalBookings}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "clientes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h3 className="text-gold font-bold text-lg">Listado de Clientes</h3>
                <Button onClick={loadUsers} className="bg-gold text-dark hover:bg-gold/90 ml-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>

              <UsersList
                users={users}
                loading={usersLoading}
                error={usersError}
                roleFilter="CLIENT"
                onRefresh={loadUsers}
                onUpdateStatus={updateUserStatus}
              />
            </div>
          )}

          {activeTab === "trabajadores" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <h3 className="text-gold font-bold text-lg">Listado de Trabajadores</h3>
                <div className="flex gap-2 ml-auto">
                  <Button onClick={loadUsers} className="bg-gold text-dark hover:bg-gold/90">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button 
                    onClick={() => setShowCreateWorkerModal(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Trabajador
                  </Button>
                </div>
              </div>

              <UsersList
                users={users}
                loading={usersLoading}
                error={usersError}
                roleFilter="WORKER"
                onRefresh={loadUsers}
                onUpdateStatus={updateUserStatus}
              />
            </div>
          )}

          {activeTab === "servicios" && (
            <div className="space-y-4">
              <h3 className="text-gold font-bold text-lg">Gestionar Servicios</h3>
              <ServicesList
                services={services}
                loading={servicesLoading}
                error={servicesError}
                onRefresh={loadServices}
                onCreate={createService}
                onUpdate={updateService}
                onDelete={deleteService}
              />
            </div>
          )}

          {activeTab === "reservas" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-dark border border-gray-light/30 text-white px-4 py-2 rounded-lg"
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
                <Button onClick={loadAllBookings} className="bg-gold text-dark hover:bg-gold/90 ml-auto">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
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
          )}
        </div>
      </div>

      {/* Modal para crear trabajador */}
      <CreateWorkerModal
        isOpen={showCreateWorkerModal}
        isLoading={creating}
        onClose={() => setShowCreateWorkerModal(false)}
        onSubmit={handleCreateWorker}
      />
    </>
  );
}
