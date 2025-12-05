"use client";
import { useEffect, useState } from 'react';
import { api } from "@/lib/api";
import { Toaster } from "@/components/ui/sonner";
import { Scissors, User, Clock, Check } from 'lucide-react';
import { Calendar } from './Calendar';
import { getUserIdFromToken } from '@/lib/auth';
import type { EventInput } from '@fullcalendar/core';

interface BookingModuleProps {
  readonly onBookingComplete?: () => void;
}

export function BookingModule({ onBookingComplete }: BookingModuleProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const totalSteps = 3;

  type Service = { id: number; name: string; description?: string; price?: number };
  const [services, setServices] = useState<Service[]>([]);
  type Worker = { id: number; name: string; bio?: string; specialties?: string; phone?: string; avatarUrl?: string };
  const [workers, setWorkers] = useState<Worker[]>([]);
  type Booking = { 
    id: number; 
    date: string; 
    status: string; 
    workerId: number; 
    userId: number; 
    service?: { name: string }; 
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myBookings, setMyBookings] = useState<EventInput[]>([]);
  const [workerBookingsMap, setWorkerBookingsMap] = useState<Map<number, EventInput[]>>(new Map());
  const clientId = getUserIdFromToken();

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getServices() as Service[];
        setServices(s);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar servicios";
        // Error is caught, intentionally not shown in UI for this view
        console.error(message);
      }
    })();
  }, []);

  // Load workers for selection
  useEffect(() => {
    (async () => {
      try {
        const w = await api.listWorkers() as Worker[];
        setWorkers(w || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar barberos";
        console.error(message);
        setWorkers([]);
      }
    })();
  }, []);

  // Cargar las reservas del cliente actual
  useEffect(() => {
    (async () => {
      try {
        const bookings = await api.myBookings() as Booking[];
        console.log("📅 Reservas cargadas del cliente:", bookings);
        
        const events: EventInput[] = bookings
          .filter(b => b.status !== 'CANCELLED') // Filtrar canceladas
          .map(b => {
            // Usar la fecha tal como viene del backend
            const bookingDate = typeof b.date === 'string' ? b.date : b.date.toISOString();
            const startDate = new Date(bookingDate);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            
            console.log(`Reserva #${b.id}: date=${b.date}, using=${bookingDate}`);
            
            return {
              id: String(b.id),
              title: b.service?.name || 'Mi Reserva',
              start: bookingDate,
              end: endDate.toISOString(),
              allDay: false,
              backgroundColor: b.status === 'CONFIRMED' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(212, 175, 55, 0.8)',
              borderColor: b.status === 'CONFIRMED' ? 'rgb(34, 197, 94)' : '#D4AF37',
              extendedProps: {
                status: b.status,
                workerId: b.workerId,
                userId: b.userId,
                isMyBooking: true,
              }
            };
          });
        
        console.log("📅 Eventos del calendario generados:", events);
        setMyBookings(events);
      } catch (err) {
        console.error("Error loading my bookings:", err);
      }
    })();
  }, []);

  // Cargar reservas cuando se selecciona un trabajador
  useEffect(() => {
    if (!selectedWorkerId) return;
    
    // Si ya tenemos las reservas de este trabajador, no recargar
    if (workerBookingsMap.has(selectedWorkerId)) return;

    (async () => {
      try {
        // Crear un mock de reservas del trabajador basado en las existentes
        // En producción, necesitarías un endpoint como /bookings/worker/:id
        const bookings = await api.myBookings() as Booking[];
        
        // Filtrar solo las reservas de este trabajador
        const workerEvents: EventInput[] = bookings
          .filter(b => b.workerId === selectedWorkerId && b.status !== 'CANCELLED')
          .map(b => {
            // Usar la fecha tal como viene del backend
            const bookingDate = typeof b.date === 'string' ? b.date : b.date.toISOString();
            const startDate = new Date(bookingDate);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            
            return {
              id: String(b.id) + '-worker',
              title: 'Ocupado',
              start: bookingDate,
              end: endDate.toISOString(),
              allDay: false,
              backgroundColor: 'rgba(107, 114, 128, 0.7)',
              borderColor: 'rgb(107, 114, 128)',
              extendedProps: {
                status: 'OCCUPIED',
                workerId: b.workerId,
                isWorkerBooking: true,
              }
            };
          });
        
        const newMap = new Map(workerBookingsMap);
        newMap.set(selectedWorkerId, workerEvents);
        setWorkerBookingsMap(newMap);
      } catch (err) {
        console.error("Error loading worker bookings:", err);
      }
    })();
  }, [selectedWorkerId, workerBookingsMap]);

  // Combinar reservas del cliente y del trabajador seleccionado
  const relevantBookings = [
    ...myBookings,
    ...(selectedWorkerId && workerBookingsMap.has(selectedWorkerId) 
      ? workerBookingsMap.get(selectedWorkerId)! 
      : [])
  ];

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      const svc = services.find((s) => s.name === selectedService);
      if (!svc) throw new Error("Servicio inválido");
      if (!selectedWorkerId) throw new Error("Selecciona un barbero");
      if (!selectedDate || !selectedTime) throw new Error("Selecciona fecha y hora en el calendario");
      
      // Crear fecha en hora local de Perú correctamente
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      
      // Crear fecha local (no UTC)
      const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Convertir a UTC para enviar al backend
      const dateTimeISO = localDate.toISOString();
      
      console.log("Creating booking:", { 
        serviceId: svc.id, 
        workerId: selectedWorkerId,
        selectedDate,
        selectedTime,
        year, month, day, hours, minutes,
        localDate: localDate.toString(),
        dateTimeISO,
        selectedBarber 
      });
      
      const result = await api.createBooking({ 
        serviceId: svc.id, 
        workerId: selectedWorkerId,
        date: dateTimeISO, 
        time: selectedTime, 
        notes: selectedBarber 
      });
      
      console.log("Booking created successfully:", result);
      alert("¡Reserva creada correctamente!");
      onBookingComplete?.();
      
      // Reset form
      setStep(1);
      setSelectedService('');
      setSelectedBarber('');
      setSelectedWorkerId(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (err: unknown) {
      console.error("Error creating booking:", err);
      const message = err instanceof Error ? err.message : "No se pudo crear la reserva";
      setError(message);
      alert(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedService !== '';
    if (step === 2) return selectedWorkerId != null;
    if (step === 3) return selectedDate !== '' && selectedTime !== '';
    return false;
  };

  return (
    <section id="reservas" className="py-24 bg-gray-dark">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="text-gold uppercase tracking-wider">Agenda tu cita</span>
          </div>
          <h2 className="text-white mb-4">Sistema de Reservas</h2>
          <p className="text-gray-400">
            Reserva tu cita en pocos pasos. Es rápido y sencillo.
          </p>
        </div>
          <Toaster />

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-light/20 -translate-y-1/2 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gold -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>

          {[
            { num: 1, icon: Scissors, label: 'Servicio' },
            { num: 2, icon: User, label: 'Barbero' },
            { num: 3, icon: Clock, label: 'Fecha y hora' },
          ].map((s) => {
            const IconComponent = s.icon;
            return (
              <div key={s.num} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step >= s.num
                      ? 'bg-gold border-gold text-dark'
                      : 'bg-gray-medium border-gray-light/30 text-gray-400'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-sm ${step >= s.num ? 'text-gold' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Booking Form */}
        <div className="bg-gray-medium p-8 rounded-lg border border-gray-light/20">
          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h3 className="text-white mb-6">Selecciona un servicio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.name)}
                    className={`p-6 rounded-lg border-2 text-left transition-all duration-300 ${
                      selectedService === service.name
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-light/20 bg-gray-dark hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">{service.name}</h4>
                        {service.description && (
                          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          {service.price != null && (
                            <p className="text-gold font-bold text-lg">S/ {Number(service.price).toFixed(2)}</p>
                          )}
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>30-60 min</span>
                          </div>
                        </div>
                      </div>
                      {selectedService === service.name && (
                        <Check className="w-6 h-6 text-gold shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Barber */}
          {step === 2 && (
            <div>
              <h3 className="text-white mb-6">Elige tu barbero</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => { setSelectedBarber(barber.name); setSelectedWorkerId(barber.id); }}
                    className={`p-6 rounded-lg border-2 text-left transition-all duration-300 ${
                      selectedWorkerId === barber.id
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-light/20 bg-gray-dark hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">{barber.name}</h4>
                      {selectedBarber === barber.name && (
                        <Check className="w-6 h-6 text-gold" />
                      )}
                    </div>
                    {barber.specialties && (
                      <p className="text-gold text-sm mb-1">{barber.specialties}</p>
                    )}
                    {barber.bio && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">{barber.bio}</p>
                    )}
                    {barber.phone && (
                      <p className="text-gray-500 text-xs">Tel: {barber.phone}</p>
                    )}
                  </button>
                ))}
                {workers.length === 0 && (
                  <p className="text-gray-400">No hay barberos disponibles.</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time via calendar */}
          {step === 3 && (
            <div>
              <h3 className="text-white mb-6">Selecciona fecha y hora</h3>
              {selectedWorkerId && (
                <div className="mb-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold text-sm">
                    📅 Mostrando disponibilidad de <span className="font-semibold">{selectedBarber}</span>
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    Los horarios ocupados incluyen tus citas y las del barbero seleccionado
                  </p>
                </div>
              )}
              <Calendar 
                onSlotSelect={(date, time) => {
                  setSelectedDate(date);
                  setSelectedTime(time);
                }}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                bookings={relevantBookings}
                workerId={selectedWorkerId || undefined}
                clientId={clientId || undefined}
              />
              {selectedDate && selectedTime && (
                <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg text-center">
                  <p className="text-gold">
                    Reserva seleccionada: {new Date(`${selectedDate}T${selectedTime}:00`).toLocaleString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/40 rounded-lg flex items-center gap-2">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-light/20">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-6 py-3 rounded transition-all duration-300 ${
                step === 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-white hover:text-gold'
              }`}
            >
              ← Atrás
            </button>

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`px-8 py-3 rounded transition-all duration-300 ${
                  canProceed()
                    ? 'bg-gold text-dark hover:bg-gold/90'
                    : 'bg-gray-light/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!canProceed() || loading}
                className={`px-8 py-3 rounded transition-all duration-300 ${
                  canProceed() && !loading
                    ? 'bg-gold text-dark hover:bg-gold/90'
                    : 'bg-gray-light/20 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Creando...' : 'Confirmar reserva'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
