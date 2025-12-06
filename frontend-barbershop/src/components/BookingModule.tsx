"use client";
import { Toaster } from "@/components/ui/sonner";
import { api } from "@/lib/api";
import { getUserIdFromToken } from '@/lib/auth';
import type { EventInput } from '@fullcalendar/core';
import { Check, Clock, Scissors, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Calendar } from './Calendar';

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
    date: string | Date; 
    status: string; 
    workerId: number; 
    userId: number; 
    service?: { name: string }; 
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
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
        setMyBookings(bookings.filter(b => b.status !== 'CANCELLED'));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar las reservas";
        console.error(message);
        setMyBookings([]);
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
        // Usar el nuevo endpoint público para obtener reservas confirmadas del trabajador
        const bookings = await api.workerConfirmedBookings(selectedWorkerId) as Array<{
          id: number;
          date: string;
          time: string;
          status: string;
        }>;
        
        console.log("📅 Reservas confirmadas del trabajador", selectedWorkerId, ":", bookings);
        
        // Convertir a eventos del calendario
        const workerEvents: EventInput[] = bookings.map(b => {
          // Usar la fecha tal como viene del backend
          const bookingDate = typeof b.date === 'string' ? b.date : b.date;
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
              workerId: selectedWorkerId,
              isWorkerBooking: true,
            }
          };
        });
        
        const newMap = new Map(workerBookingsMap);
        newMap.set(selectedWorkerId, workerEvents);
        setWorkerBookingsMap(newMap);
      } catch (err) {
        console.error("Error loading worker bookings:", err);
        // Si hay error, establecer array vacío para este trabajador
        const newMap = new Map(workerBookingsMap);
        newMap.set(selectedWorkerId, []);
        setWorkerBookingsMap(newMap);
      }
    })();
  }, [selectedWorkerId, workerBookingsMap]);

  // Combinar reservas del cliente y trabajador con colores según quién está ocupado
  const relevantBookings = useMemo(() => {
    const events: EventInput[] = [];
    const conflictTimes = new Set<string>(); // Para rastrear horarios con conflicto
    
    // Primero, detectar todos los conflictos
    if (selectedWorkerId && workerBookingsMap.has(selectedWorkerId)) {
      const workerEvents = workerBookingsMap.get(selectedWorkerId)! || [];
      
      workerEvents.forEach(wEvent => {
        if (!wEvent.start) return;
        
        const bookingStart = new Date(wEvent.start as string);
        const bookingEnd = wEvent.end ? new Date(wEvent.end as string) : new Date(bookingStart.getTime() + 60 * 60 * 1000);
        
        const hasClientBooking = myBookings.some(b => {
          const clientStart = new Date(typeof b.date === 'string' ? b.date : b.date.toISOString());
          const clientEnd = new Date(clientStart.getTime() + 60 * 60 * 1000);
          
          return clientStart < bookingEnd && clientEnd > bookingStart;
        });
        
        if (hasClientBooking) {
          conflictTimes.add(`${bookingStart.getTime()}`);
        }
      });
    }
    
    // Convertir bookings del cliente a eventos amarillos (solo si no hay conflicto)
    myBookings.forEach(b => {
      const bookingDate = typeof b.date === 'string' ? b.date : b.date.toISOString();
      const startDate = new Date(bookingDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      if (!conflictTimes.has(`${startDate.getTime()}`)) {
        events.push({
          id: `client-${b.id}`,
          title: 'Ocupado (Cliente)',
          start: bookingDate,
          end: endDate.toISOString(),
          allDay: false,
          backgroundColor: 'rgba(212, 175, 55, 0.8)', // Amarillo - Cliente
          borderColor: '#D4AF37',
          extendedProps: {
            type: 'client',
            bookingId: b.id,
          }
        });
      }
    });
    
    // Convertir bookings del trabajador a eventos grises o rojos
    if (selectedWorkerId && workerBookingsMap.has(selectedWorkerId)) {
      const workerEvents = workerBookingsMap.get(selectedWorkerId)! || [];
      
      workerEvents.forEach(wEvent => {
        if (!wEvent.start) return;
        
        const bookingStart = new Date(wEvent.start as string);
        const bookingEnd = wEvent.end ? new Date(wEvent.end as string) : new Date(bookingStart.getTime() + 60 * 60 * 1000);
        
        const hasClientBooking = myBookings.some(b => {
          const clientStart = new Date(typeof b.date === 'string' ? b.date : b.date.toISOString());
          const clientEnd = new Date(clientStart.getTime() + 60 * 60 * 1000);
          
          return clientStart < bookingEnd && clientEnd > bookingStart;
        });
        
        if (hasClientBooking) {
          // Ambos ocupados - Rojo
          events.push({
            ...wEvent,
            id: `both-${wEvent.id}`,
            title: 'Ocupado (Ambos)',
            backgroundColor: 'rgba(239, 68, 68, 0.8)', // Rojo
            borderColor: 'rgb(239, 68, 68)',
            extendedProps: {
              type: 'both',
              ...wEvent.extendedProps
            }
          });
        } else {
          // Solo trabajador - Gris
          events.push({
            ...wEvent,
            title: 'Ocupado (Trabajador)',
            backgroundColor: 'rgba(107, 114, 128, 0.8)', // Gris
            borderColor: 'rgb(107, 114, 128)',
            extendedProps: {
              type: 'worker',
              ...wEvent.extendedProps
            }
          });
        }
      });
    }
    
    return events;
  }, [myBookings, selectedWorkerId, workerBookingsMap]);

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
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-gold uppercase tracking-[0.2em] text-xs sm:text-sm">Agenda tu cita</p>
          <h2 className="text-white text-3xl sm:text-4xl font-semibold">Sistema de reservas en 3 pasos</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Elige servicio, barbero y horario en minutos. Confirmación inmediata y recordatorios automáticos.</p>
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
        <div className="bg-gray-medium/90 backdrop-blur p-8 rounded-xl border border-gray-light/20 shadow-xl">
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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Barberos List */}
                <div className="lg:col-span-2 space-y-3">
                  {workers.map((barber) => (
                    <button
                      key={barber.id}
                      onClick={() => { setSelectedBarber(barber.name); setSelectedWorkerId(barber.id); }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                        selectedWorkerId === barber.id
                          ? 'border-gold bg-gold/10'
                          : 'border-gray-light/20 bg-gray-dark hover:border-gold/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{barber.name}</h4>
                          {barber.specialties && (
                            <p className="text-gold text-xs mt-1">{barber.specialties}</p>
                          )}
                        </div>
                        {selectedBarber === barber.name && (
                          <Check className="w-5 h-5 text-gold shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                  {workers.length === 0 && (
                    <p className="text-gray-400">No hay barberos disponibles.</p>
                  )}
                </div>

                {/* Worker Profile Preview */}
                {selectedWorkerId && workers.length > 0 && (
                  <div className="lg:col-span-2">
                    {(() => {
                      const selectedWorker = workers.find(w => w.id === selectedWorkerId);
                      return selectedWorker ? (
                        <div className="bg-gradient-to-br from-gray-dark via-gray-dark to-gray-medium border border-gold/30 rounded-xl p-6 sticky top-4">
                          <div className="space-y-4">
                            {/* Avatar */}
                            <div className="flex justify-center">
                              {selectedWorker.avatarUrl ? (
                                <img 
                                  src={selectedWorker.avatarUrl} 
                                  alt={selectedWorker.name}
                                  className="w-24 h-24 rounded-full object-cover border-3 border-gold"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold/50 flex items-center justify-center border-3 border-gold">
                                  <User className="w-12 h-12 text-dark" />
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <div className="text-center">
                              <h4 className="text-white text-xl font-bold">{selectedWorker.name}</h4>
                              <p className="text-gold text-sm mt-1">✨ Barbero profesional</p>
                            </div>

                            {/* Specialties */}
                            {selectedWorker.specialties && (
                              <div className="space-y-2">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Especialidades</p>
                                <p className="text-gray-200 text-sm leading-relaxed">{selectedWorker.specialties}</p>
                              </div>
                            )}

                            {/* Bio */}
                            {selectedWorker.bio && (
                              <div className="space-y-2 py-3 border-y border-gray-light/20">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Acerca de</p>
                                <p className="text-gray-300 text-sm leading-relaxed">{selectedWorker.bio}</p>
                              </div>
                            )}

                            {/* Contact */}
                            {selectedWorker.phone && (
                              <div className="space-y-2">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Contacto</p>
                                <p className="text-gray-300 text-sm font-mono bg-gray-dark/50 px-3 py-2 rounded border border-gray-light/20">
                                  📱 {selectedWorker.phone}
                                </p>
                              </div>
                            )}

                            {/* CTA */}
                            <div className="pt-2 border-t border-gray-light/20">
                              <p className="text-center text-gray-400 text-xs">
                                Continúa para ver disponibilidad
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
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
              
              {/* Worker Profile Card */}
              {selectedWorkerId && workers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  {/* Worker Info */}
                  {(() => {
                    const selectedWorker = workers.find(w => w.id === selectedWorkerId);
                    return selectedWorker ? (
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-gray-dark via-gray-dark to-gray-medium border border-gold/20 rounded-xl p-6 h-full flex flex-col justify-between">
                          {/* Avatar Placeholder */}
                          <div className="flex justify-center mb-4">
                            {selectedWorker.avatarUrl ? (
                              <img 
                                src={selectedWorker.avatarUrl} 
                                alt={selectedWorker.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gold"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold/50 flex items-center justify-center border-2 border-gold">
                                <User className="w-10 h-10 text-dark" />
                              </div>
                            )}
                          </div>
                          
                          {/* Worker Details */}
                          <div className="text-center space-y-3 flex-1">
                            <h4 className="text-white text-lg font-semibold">{selectedWorker.name}</h4>
                            
                            {selectedWorker.specialties && (
                              <div className="space-y-1">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Especialidades</p>
                                <p className="text-gray-300 text-sm">{selectedWorker.specialties}</p>
                              </div>
                            )}
                            
                            {selectedWorker.bio && (
                              <div className="space-y-1">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Descripción</p>
                                <p className="text-gray-400 text-xs line-clamp-3">{selectedWorker.bio}</p>
                              </div>
                            )}
                            
                            {selectedWorker.phone && (
                              <div className="space-y-1 pt-2 border-t border-gray-light/20">
                                <p className="text-gold text-xs font-semibold uppercase tracking-wider">Contacto</p>
                                <p className="text-gray-300 text-sm font-mono">{selectedWorker.phone}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Call to Action */}
                          <div className="mt-4 pt-4 border-t border-gray-light/20">
                            <p className="text-gold text-xs text-center">✨ Perfil verificado</p>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  
                  {/* Calendar */}
                  <div className="lg:col-span-3">
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
                  </div>
                </div>
              )}
              
              {!selectedWorkerId && (
                <div className="bg-gray-dark border border-gray-light/20 rounded-lg p-8 text-center mb-6">
                  <p className="text-gray-400">Vuelve al paso anterior para seleccionar un barbero</p>
                </div>
              )}
              
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
