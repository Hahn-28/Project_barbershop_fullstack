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
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clientes" | "trabajadores" | "servicios" | "reservas">("dashboard");
  const tabConfig = [
    { key: "dashboard", label: "Dashboard", icon: <Users className="w-5 h-5 mr-2 text-gold" /> },
    { key: "clientes", label: "Clientes", icon: <Users className="w-5 h-5 mr-2 text-green-400" /> },
    { key: "trabajadores", label: "Trabajadores", icon: <Wrench className="w-5 h-5 mr-2 text-blue-400" /> },
    { key: "servicios", label: "Servicios", icon: <Plus className="w-5 h-5 mr-2 text-purple-400" /> },
    { key: "reservas", label: "Reservas", icon: <Calendar className="w-5 h-5 mr-2 text-gold" /> },
  ];
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [userFilter, setUserFilter] = useState("ALL");
  const [workerFilter, setWorkerFilter] = useState("ALL");
  const [showCreateWorkerModal, setShowCreateWorkerModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const { bookings, loadAllBookings, updateBookingStatus } = useAdminBookings();
  const { users, loading: usersLoading, error: usersError, loadUsers, updateUserStatus, deleteUser } = useUsers();
  const { services, loading: servicesLoading, error: servicesError, loadServices, createService, updateService, deleteService } = useServices();
  const { creating, createUser } = useCreateUser();

  const handleDeleteUser = async (id: number) => {
    await deleteUser(id);
    loadUsers();
  };

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
    if (userFilter !== "ALL" && b.userId !== Number.parseInt(userFilter)) {
      return false;
    }
    if (workerFilter !== "ALL" && b.workerId !== Number.parseInt(workerFilter)) {
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
    setSelectedBookingId(Number.parseInt(bookingId));
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark">
        {/* Header Mejorado */}
        <div className="bg-gradient-to-r from-gray-dark/95 via-gray-900/95 to-gray-dark/95 backdrop-blur-xl border-b border-gold/20 sticky top-0 z-50 shadow-2xl">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-gold text-3xl font-bold drop-shadow-lg flex items-center gap-2">
                  <Users className="w-8 h-8 text-gold" />
                  Panel de Administración
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium truncate max-w-[200px] flex items-center gap-1">
                    <Users className="w-4 h-4 text-gold" /> {userName}
                  </span>
                  <span className="text-xs text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30 shadow-md">{userRole}</span>
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
          {/* Stats Cards Mejoradas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">Total Usuarios <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full text-xs font-bold ml-2">{adminCount} Admin</span></p>
                  <p className="text-gold text-3xl font-bold">{totalUsers}</p>
                </div>
                <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-gold" />
                </div>
              </div>
            </div>
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-6 shadow-xl">
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
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6 shadow-xl">
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
            <div className="bg-gray-dark/60 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-xl">
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

          {/* Tabs Mejoradas */}
          <div className="flex gap-2 border-b border-gray-light/15 mb-8 overflow-x-auto">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "dashboard" | "clientes" | "trabajadores" | "servicios" | "reservas")}
                className={`py-3 px-6 font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.key
                    ? "border-gold text-gold bg-gold/5 shadow-lg"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "clientes" && clientCount > 0 && (
                  <span className="ml-2 bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-bold">{clientCount}</span>
                )}
                {tab.key === "trabajadores" && workerCount > 0 && (
                  <span className="ml-2 bg-blue-400/20 text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">{workerCount}</span>
                )}
                {tab.key === "servicios" && services.length > 0 && (
                  <span className="ml-2 bg-purple-400/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-bold">{services.length}</span>
                )}
                {tab.key === "reservas" && totalBookings > 0 && (
                  <span className="ml-2 bg-gold/20 text-gold px-2 py-0.5 rounded-full text-xs font-bold">{totalBookings}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Gráfico de Estado de Reservas - Ancho completo */}
              <div className="bg-gradient-to-br from-gray-dark/80 via-gray-dark/60 to-gray-dark/80 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-2xl hover:shadow-gold/20 transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Estado de Reservas</h3>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <PieChart>
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Pendientes', value: pendingBookings, color: '#eab308' },
                        { name: 'Confirmadas', value: confirmedBookings, color: '#4ade80' },
                        { name: 'Completadas', value: bookings.filter(b => b.status === 'COMPLETE').length, color: '#60a5fa' },
                        { name: 'Canceladas', value: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={{
                        stroke: '#9ca3af',
                        strokeWidth: 2,
                      }}
                      label={({ name, percent }) => (percent && percent > 0) ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      outerRadius={120}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={3}
                      style={{ filter: 'url(#shadow)' }}
                    >
                      {[
                        { name: 'Pendientes', value: pendingBookings, color: '#eab308' },
                        { name: 'Confirmadas', value: confirmedBookings, color: '#4ade80' },
                        { name: 'Completadas', value: bookings.filter(b => b.status === 'COMPLETE').length, color: '#60a5fa' },
                        { name: 'Canceladas', value: bookings.filter(b => b.status === 'CANCELLED').length, color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="#1f2937"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '2px solid #D4AF37', 
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px rgba(212, 175, 55, 0.2)'
                      }}
                      itemStyle={{ color: '#fff', fontWeight: '500' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      iconType="circle"
                      iconSize={10}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Reservas por Servicio */}
              <div className="bg-gradient-to-br from-gray-dark/80 via-gray-dark/60 to-gray-dark/80 backdrop-blur-sm border border-gold/20 rounded-2xl p-6 shadow-2xl hover:shadow-gold/20 transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-white text-xl font-bold">Reservas por Servicio</h3>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart 
                    data={
                      services.map(service => ({
                        name: service.name.length > 15 ? service.name.substring(0, 15) + '...' : service.name,
                        reservas: bookings.filter(b => b.serviceId === service.id).length,
                      }))
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#D4AF37" 
                      style={{ fontSize: '12px', fontWeight: '600' }}
                      tick={{ fill: '#9ca3af' }}
                      angle={-15}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                      tick={{ fill: '#9ca3af' }}
                      label={{ value: 'Cantidad de Reservas', angle: -90, position: 'insideLeft', fill: '#D4AF37', fontSize: 14, fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        border: '2px solid #D4AF37', 
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 4px 6px rgba(212, 175, 55, 0.2)'
                      }}
                      labelStyle={{ color: '#D4AF37', fontWeight: 'bold', marginBottom: '8px' }}
                      itemStyle={{ color: '#fff', fontWeight: '500' }}
                      cursor={{ stroke: '#D4AF37', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: '#D4AF37',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                      iconType="line"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="reservas" 
                      stroke="#D4AF37" 
                      strokeWidth={4} 
                      dot={{ 
                        fill: '#D4AF37', 
                        r: 8,
                        strokeWidth: 3,
                        stroke: '#1f2937'
                      }}
                      activeDot={{ 
                        r: 10,
                        fill: '#D4AF37',
                        stroke: '#fff',
                        strokeWidth: 3
                      }}
                      fill="url(#colorReservas)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Resúmenes existentes */}
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
                onDelete={handleDeleteUser}
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
                onDelete={handleDeleteUser}
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
              {/* Título de Reservas */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-gold" />
                <h3 className="text-gold font-bold text-2xl">Listado de Reservas</h3>
              </div>
              
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
