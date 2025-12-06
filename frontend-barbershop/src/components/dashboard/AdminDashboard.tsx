import { useState, useEffect } from "react";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CreateWorkerModal } from "./CreateWorkerModal";
import { UsersList } from "./UsersList";
import { ServicesList } from "./ServicesList";
import { BookingEditModal } from "./BookingEditModal";
import { useAdminBookings } from "@/lib/hooks/useAdminBookings";
import { useCreateUser } from "@/lib/hooks/useCreateUser";
import { useUsers } from "@/lib/hooks/useUsers";
import { useServices } from "@/lib/hooks/useServices";
import { Toaster } from "@/components/ui/sonner";
import { Users, Calendar, Plus, Wrench, RefreshCw } from "lucide-react";
import { PersonalCalendar } from "@/components/PersonalCalendar";
import type { EventInput } from "@fullcalendar/core";
import type { NewUser } from "@/lib/hooks/useCreateUser";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clientes" | "trabajadores" | "servicios" | "reservas">("dashboard");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [workerFilter, setWorkerFilter] = useState("ALL");
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const { bookings, loading, error, loadAllBookings, confirmBooking, cancelBooking, updateBookingStatus } = useAdminBookings();
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

  // Obtener lista única de usuarios (clientes) con reservas
  const usersWithBookings = Array.from(
    new Map(
      bookings
        .filter(b => b.user)
        .map(b => [b.user!.id, b.user!])
    ).values()
  );

  // Obtener lista única de trabajadores con reservas
  const workersWithBookings = Array.from(
    new Map(
      bookings
        .filter(b => b.worker)
        .map(b => [b.worker!.id, b.worker!])
    ).values()
  );

  // Convertir reservas a eventos de calendario con filtros
  const filteredBookings = bookings.filter(b => {
    if (userFilter !== "ALL" && b.userId !== parseInt(userFilter)) {
      return false;
    }
    if (workerFilter !== "ALL" && b.workerId !== parseInt(workerFilter)) {
      return false;
    }
    if (statusFilter !== "ALL" && b.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const calendarEvents: EventInput[] = filteredBookings.map(b => {
    const bookingDate = typeof b.date === 'string' ? b.date : b.date.toISOString();
    const startDate = new Date(bookingDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    return {
      id: String(b.id),
      title: b.service?.name || 'Reserva',
      start: bookingDate,
      end: endDate.toISOString(),
      allDay: false,
      extendedProps: {
        status: b.status,
        clientName: b.user?.name,
        workerName: b.worker?.name,
      }
    };
  });

  // Obtener la reserva seleccionada
  const selectedBooking = selectedBookingId 
    ? bookings.find(b => b.id === selectedBookingId)
    : null;

  const handleEditBooking = (bookingId: string) => {
    setSelectedBookingId(parseInt(bookingId));
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-dark/95 via-gray-900/95 to-gray-dark/95 backdrop-blur-xl border-b border-gold/20 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-gold text-3xl font-bold drop-shadow-lg">Panel de Administración</h1>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium truncate max-w-[200px]">{userName}</span>
                  <span className="text-xs text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30">{userRole}</span>
                </div>
              </div>
              <Button onClick={onLogout} className="bg-red-600/90 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl border border-red-500/30 shadow-lg hover:shadow-red-500/20 transition-all w-full md:w-auto">
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-xl hover:shadow-gold/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
                  <p className="text-gold text-3xl font-bold">{totalUsers}</p>
                </div>
                <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-gold" />
                </div>
              </div>
            </div>
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Trabajadores</p>
                  <p className="text-blue-400 text-3xl font-bold">{workerCount}</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-7 h-7 text-blue-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 shadow-xl hover:shadow-green-500/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Clientes</p>
                  <p className="text-green-400 text-3xl font-bold">{clientCount}</p>
                </div>
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-green-400" />
                </div>
              </div>
            </div>
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-xl hover:shadow-gold/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Reservas</p>
                  <p className="text-gold text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-gold" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-light/15 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "dashboard"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("clientes")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "clientes"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab("trabajadores")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "trabajadores"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Trabajadores
            </button>
            <button
              onClick={() => setActiveTab("servicios")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "servicios"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Servicios
            </button>
            <button
              onClick={() => setActiveTab("reservas")}
              className={`py-3 px-6 font-semibold border-b-2 transition-all whitespace-nowrap rounded-t-lg ${
                activeTab === "reservas"
                  ? "border-gold text-gold bg-gold/5"
                  : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Reservas
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-white text-xl font-bold mb-6">Resumen Usuarios</h3>
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

                <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-white text-xl font-bold mb-6">Resumen Reservas</h3>
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
            <div className="space-y-6">
              {/* Filtros */}
              <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white text-lg font-bold mb-4">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Filtrar por Estado</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-gray-dark border border-gray-light/30 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-gold/50 transition"
                    >
                      <option value="ALL">Todos</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="CONFIRMED">Confirmada</option>
                      <option value="COMPLETE">Completada</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Filtrar por Cliente</label>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="w-full bg-gray-dark border border-gray-light/30 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-gold/50 transition"
                    >
                      <option value="ALL">Ver Todos</option>
                      {usersWithBookings.map(user => (
                        <option key={user.id} value={String(user.id)}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Filtrar por Trabajador</label>
                    <select
                      value={workerFilter}
                      onChange={(e) => setWorkerFilter(e.target.value)}
                      className="w-full bg-gray-dark border border-gray-light/30 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-gold/50 transition"
                    >
                      <option value="ALL">Ver Todos</option>
                      {workersWithBookings.map(worker => (
                        <option key={worker.id} value={String(worker.id)}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Calendario */}
              <div className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-6 shadow-xl h-[700px]">
                <div className="h-full overflow-hidden">
                  <PersonalCalendar 
                    bookings={calendarEvents}
                    title="Calendario de Reservas"
                    onEventClick={handleEditBooking}
                  />
                </div>
              </div>
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

      {/* Modal para editar reserva */}
      <BookingEditModal
        isOpen={selectedBookingId !== null}
        booking={selectedBooking || null}
        onClose={() => setSelectedBookingId(null)}
        onStatusChange={updateBookingStatus}
      />
    </>
  );
}
