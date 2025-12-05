"use client";
import { useEffect, useMemo, useState } from 'react';
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster, toast } from "@/components/ui/sonner";
import { Scissors, User, CalendarDays, Clock, Check } from 'lucide-react';
import { Calendar } from './Calendar';

export function BookingModule({ onBookingComplete }: { onBookingComplete?: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  type Service = { id: number; name: string; price?: number };
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getServices() as Service[];
        setServices(s);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar servicios";
        setError(message);
      }
    })();
  }, []);

  const barbers = [
    { id: 'carlos', name: 'Carlos Méndez' },
    { id: 'miguel', name: 'Miguel Ángel Torres' },
    { id: 'ricardo', name: 'Ricardo Hernández' },
  ];

  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
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
      const dateIso = `${selectedDate}T${selectedTime}:00`;
      await api.createBooking({ serviceId: svc.id, date: dateIso, time: selectedTime, notes: selectedBarber });
      alert("Reserva creada correctamente");
      onBookingComplete?.();
      setStep(1);
      setSelectedService('');
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo crear la reserva";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedService !== '';
    if (step === 2) return selectedBarber !== '';
    if (step === 3) return selectedDate !== '';
    if (step === 4) return selectedTime !== '';
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
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>

          {[
            { num: 1, icon: Scissors, label: 'Servicio' },
            { num: 2, icon: User, label: 'Barbero' },
            { num: 3, icon: CalendarDays, label: 'Fecha' },
            { num: 4, icon: Clock, label: 'Hora' },
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
                        <Check className="w-6 h-6 text-gold flex-shrink-0" />
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
              <div className="grid grid-cols-1 gap-4">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => setSelectedBarber(barber.name)}
                    className={`p-6 rounded-lg border-2 text-left transition-all duration-300 ${
                      selectedBarber === barber.name
                        ? 'border-gold bg-gold/10'
                        : 'border-gray-light/20 bg-gray-dark hover:border-gold/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-white">{barber.name}</h4>
                      {selectedBarber === barber.name && (
                        <Check className="w-6 h-6 text-gold" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date */}
          {step === 3 && (
            <div>
              <h3 className="text-white mb-6">Selecciona la fecha</h3>
              <Calendar 
                onDateSelect={(date) => setSelectedDate(date)}
                selectedDate={selectedDate}
              />
              {selectedDate && (
                <div className="mt-4 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold text-center">
                    Fecha seleccionada: {new Date(selectedDate).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Select Time */}
          {step === 4 && (
            <div>
              <h3 className="text-white mb-6">Elige la hora</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedTime === time
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gray-light/20 bg-gray-dark text-white hover:border-gold/50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
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

            {step < 4 ? (
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
