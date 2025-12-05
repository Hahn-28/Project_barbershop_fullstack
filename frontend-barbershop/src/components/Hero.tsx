import Image from 'next/image';
import { CalendarDays } from 'lucide-react';

export function Hero() {
  const scrollToBooking = () => {
    const element = document.getElementById('reservas');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1759134198561-e2041049419c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXJiZXJzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY0NTk1MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Barbería Premium"
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-left">
        <div className="max-w-3xl">
          <div className="mb-6 inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-full">
            <span className="text-gold">Barbería Premium desde 2015</span>
          </div>
          
          <h1 className="text-white mb-6">
            Reserva tu estilo,<br />
            <span className="text-gold">hoy</span>
          </h1>
          
          <p className="text-gray-300 text-xl mb-8 max-w-xl">
            Cortes premium con barberos expertos. Experimenta el servicio de una barbería de clase mundial.
          </p>

          <button 
            onClick={scrollToBooking}
            className="bg-gold text-dark px-8 py-4 rounded-lg inline-flex items-center gap-3 hover:bg-gold/90 transition-all duration-300 shadow-2xl hover:shadow-gold/50 group"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Agendar cita</span>
          </button>
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
