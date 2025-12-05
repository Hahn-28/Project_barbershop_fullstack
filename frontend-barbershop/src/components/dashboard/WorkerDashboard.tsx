import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { getNameFromToken, getRoleFromToken } from "@/lib/auth";
import { useWorkerBookings } from "@/lib/hooks/useWorkerBookings";

interface WorkerDashboardProps {
  onLogout: () => void;
}

export function WorkerDashboard({ onLogout }: WorkerDashboardProps) {
  const { bookings, loading, error, loadWorkerBookings, confirmBooking, cancelBooking } = useWorkerBookings();
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadWorkerBookings();
  }, [loadWorkerBookings]);

  const filtered = bookings.filter(b => statusFilter === "ALL" ? true : b.status === statusFilter);
  const userName = getNameFromToken();
  const userRole = getRoleFromToken();

  return (
    <>
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 bg-gradient-to-r from-dark via-gray-900 to-dark/90 border border-gold/30 rounded-lg p-4 shadow-gold/10">
          <div>
            <h2 className="text-gold text-2xl font-extrabold mb-1 drop-shadow">Panel de Trabajador</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
              <span className="text-white text-base font-semibold truncate max-w-[180px]">{userName}</span>
              <span className="text-xs text-gray-300 italic bg-gold/10 px-2 py-1 rounded">{userRole}</span>
            </div>
          </div>
          <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-lg border-2 border-red-400/60 shadow-lg transition-all">
            Cerrar sesión
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
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
            <Button onClick={loadWorkerBookings} className="bg-gold text-dark hover:bg-gold/90">
              <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
            <p className="text-white text-lg">Cargando reservas...</p>
          </div>
        )}

        {error && !loading && (
          <Alert className="mb-6 border-red-500/40 bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertTitle className="text-red-500">Error al cargar reservas</AlertTitle>
            <AlertDescription className="text-red-300">
              {error}
              <Button onClick={loadWorkerBookings} className="ml-4 bg-red-600 hover:bg-red-700 text-white" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" /> Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!loading && filtered.length === 0 && !error && (
          <Card className="p-8 bg-gray-dark border border-gray-light/20 text-center">
            <p className="text-gray-300">No tienes reservas asignadas con este estado</p>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((b) => (
              <Card key={b.id} className="p-6 bg-gray-dark border border-gray-light/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-white mb-1">{b.service?.name || `Servicio #${b.serviceId}`}</h4>
                    <p className="text-gray-400">{new Date(b.date).toLocaleString()}</p>
                    {b.user && (
                      <p className="text-sm text-gray-300">Cliente: <span className="text-white font-semibold">{b.user.name}</span> <span className="text-gray-400 text-xs">{b.user.email}</span></p>
                    )}
                  </div>
                  <div className="text-right">
                    {b.service?.price != null && (
                      <p className="text-gold mb-2">S/ {Number(b.service.price).toFixed(2)}</p>
                    )}
                    <span className="px-3 py-1 rounded-full text-sm bg-gold/10 text-gold">{b.status}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  {b.status !== "CONFIRMED" && (
                    <Button onClick={() => confirmBooking(b.id)} className="bg-green-600 hover:bg-green-700 text-white">
                      Confirmar
                    </Button>
                  )}
                  {b.status !== "CANCELLED" && (
                    <Button onClick={() => cancelBooking(b.id)} className="bg-red-600 hover:bg-red-700 text-white">
                      Rechazar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
