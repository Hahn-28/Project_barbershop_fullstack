import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Clock, User, Scissors, DollarSign, FileText, Save, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface Booking {
  id: number;
  status: string;
  date: string | Date;
  notes?: string;
  service?: { name: string; price?: number };
  user?: { id: number; name: string; email?: string; phone?: string };
  worker?: { id: number; name: string; email?: string; phone?: string };
}

interface BookingEditModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onStatusChange: (bookingId: number, status: string) => Promise<void>;
}

export function BookingEditModal({ isOpen, booking, onClose, onStatusChange }: BookingEditModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setSelectedStatus(booking.status);
    }
  }, [booking]);

  if (!isOpen || !booking) {
    return null;
  }

  const handleStatusChange = async () => {
    if (selectedStatus === booking.status) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(booking.id, selectedStatus);
      onClose();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Error al actualizar la reserva");
    } finally {
      setIsLoading(false);
    }
  };

  const bookingDate = new Date(booking.date);
  const formattedDate = bookingDate.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
    PENDING: { color: 'from-yellow-500 to-yellow-600', label: 'Pendiente', icon: '⏳' },
    CONFIRMED: { color: 'from-green-500 to-green-600', label: 'Confirmada', icon: '✓' },
    COMPLETE: { color: 'from-blue-500 to-blue-600', label: 'Completada', icon: '✓✓' },
    CANCELLED: { color: 'from-red-500 to-red-600', label: 'Cancelada', icon: '✗' }
  };

  const currentStatus = statusConfig[booking.status];
  const newStatus = statusConfig[selectedStatus];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-dark via-gray-dark to-gray-dark border border-gold/20 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 border-b border-gold/30 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white text-xl font-bold">Detalles de Reserva</h2>
            <p className="text-gray-400 text-xs mt-0.5">ID: #{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Grid de Detalles - Compacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Servicio */}
            <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3 hover:border-gold/30 transition">
              <div className="flex items-center gap-2 mb-1">
                <Scissors className="w-4 h-4 text-gold" />
                <p className="text-gray-400 text-xs font-semibold">Servicio</p>
              </div>
              <p className="text-white text-sm font-bold">{booking.service?.name || 'Sin especificar'}</p>
            </div>

            {/* Cliente */}
            <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3 hover:border-gold/30 transition">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-blue-400" />
                <p className="text-gray-400 text-xs font-semibold">Cliente</p>
              </div>
              <p className="text-white text-sm font-bold">{booking.user?.name || 'Sin especificar'}</p>
            </div>

            {/* Trabajador */}
            <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3 hover:border-gold/30 transition">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-400" />
                <p className="text-gray-400 text-xs font-semibold">Trabajador</p>
              </div>
              <p className="text-white text-sm font-bold">{booking.worker?.name || 'Sin asignar'}</p>
            </div>

            {/* Fecha y Hora */}
            <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3 hover:border-gold/30 transition">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-cyan-400" />
                <p className="text-gray-400 text-xs font-semibold">Fecha</p>
              </div>
              <p className="text-white text-sm font-bold">{formattedDate}</p>
            </div>

            {/* Precio */}
            {booking.service?.price && (
              <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3 hover:border-gold/30 transition">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <p className="text-gray-400 text-xs font-semibold">Precio</p>
                </div>
                <p className="text-gold text-sm font-bold">S/ {Number(booking.service.price).toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Notas Compactas */}
          {booking.notes && (
            <div className="bg-gradient-to-br from-gray-dark/50 to-gray-dark/30 border border-gray-light/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <p className="text-gray-400 text-xs font-semibold">Notas</p>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* Estado Actual */}
          <div className={`bg-gradient-to-r ${currentStatus.color} rounded-lg p-4 border border-white/20`}>
            <p className="text-white/80 text-xs mb-1">Estado Actual</p>
            <p className="text-white text-lg font-bold">
              {currentStatus.icon} {currentStatus.label}
            </p>
          </div>

          {/* Selector de Estados */}
          <div>
            <label className="block text-white text-xs font-bold mb-2 uppercase tracking-wide">Cambiar Estado</label>
            <div className="grid grid-cols-2 gap-2">
              {['PENDING', 'CONFIRMED', 'COMPLETE', 'CANCELLED'].map(status => {
                const config = statusConfig[status];
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`relative px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 ${
                      isSelected
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                        : 'bg-gray-dark/60 border border-gray-light/20 text-gray-300 hover:border-gold/50 hover:text-white'
                    }`}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Cambio */}
          {selectedStatus !== booking.status && (
            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
              <p className="text-blue-300 text-xs">
                <span className="font-bold">Cambio pendiente:</span> {statusConfig[booking.status].label} → {newStatus.label}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-dark/50 to-gray-dark/30 border-t border-gray-light/10 px-6 py-3 flex gap-2 flex-shrink-0">
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-all h-10 border border-gray-600"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStatusChange}
            className="flex-1 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-black rounded-lg font-black text-sm shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/70 transition-all h-10 border border-yellow-600"
            disabled={isLoading || selectedStatus === booking.status}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-bold">Guardando...</span>
              </span>
            ) : selectedStatus === booking.status ? (
              <span className="font-semibold">Sin cambios</span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                <span className="font-bold">Guardar</span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
