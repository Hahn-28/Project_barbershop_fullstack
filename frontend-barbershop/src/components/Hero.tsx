import Image from 'next/image';
import { CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

export function Hero() {
  const scrollToBooking = () => {
    const element = document.getElementById('reservas');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const element = document.getElementById('servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80"
          alt="Barbería Premium"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/85 to-dark/70" />
        <div className="absolute -left-10 top-10 w-80 h-80 bg-gold/10 blur-3xl rounded-full" />
        <div className="absolute -right-10 bottom-0 w-72 h-72 bg-gold/5 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 items-center gap-12">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full backdrop-blur">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm">Barbería premium desde 2015</span>
            </div>
            
            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Reserva tu estilo,
              <br />
              <span className="text-gold">hoy mismo</span>
            </h1>
            
            <p className="text-gray-200 text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed">
              Cortes de precisión, rituales de afeitado y cuidado de barba con productos de grado profesional. Experimenta el servicio de una barbería de clase mundial.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <button 
                onClick={scrollToBooking}
                className="bg-gold text-dark px-8 py-4 rounded-xl inline-flex items-center gap-3 hover:bg-gold/90 transition-all duration-300 shadow-2xl hover:shadow-gold/50 group"
              >
                <CalendarDays className="w-5 h-5" />
                <span className="font-semibold">Agendar cita</span>
              </button>
              <button
                onClick={scrollToServices}
                className="text-white border border-white/15 hover:border-gold hover:text-gold px-7 py-4 rounded-xl transition-all duration-300 backdrop-blur"
              >
                Ver servicios
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-300 max-w-xl">
              {[['+12k', 'Cortes realizados'], ['4.9/5', 'Puntuación promedio'], ['48h', 'Garantía de ajuste']].map(([stat, label]) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 backdrop-blur">
                  <p className="text-gold text-2xl font-bold">{stat}</p>
                  <p className="text-sm text-gray-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur shadow-2xl max-w-xl w-full mx-auto lg:mx-0 lg:justify-self-end">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Experiencia ÉLITE</p>
                <h3 className="text-white text-xl font-semibold">Cero esperas. Cero sorpresas.</h3>
              </div>
            </div>

            <ul className="space-y-4 text-gray-200">
              <li className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-gold mt-2" />
                <div>
                  <p className="font-semibold text-white">Calendario en tiempo real</p>
                  <p className="text-sm text-gray-300">Confirma disponibilidad al instante y recibe recordatorios automáticos.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-gold mt-2" />
                <div>
                  <p className="font-semibold text-white">Barberos certificados</p>
                  <p className="text-sm text-gray-300">Especialistas en fades, barbas y rituales clásicos con productos premium.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-gold mt-2" />
                <div>
                  <p className="font-semibold text-white">Garantía de ajuste 48h</p>
                  <p className="text-sm text-gray-300">Si algo no te convence, lo perfeccionamos sin costo.</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 rounded-xl border border-gold/30 bg-gold/5 text-sm text-gray-200">
              <p className="text-gold font-semibold mb-1">Tip</p>
              <p>Reserva los viernes antes de las 5pm para asegurar horario premium de fin de semana.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-gold/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-gold rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
