import Image from 'next/image';
import { CalendarDays } from 'lucide-react';

export function Barbers() {
  const barbers = [
    {
      id: 1,
      name: 'Carlos Méndez',
      image: 'https://images.unsplash.com/photo-1747832512459-5566e6d0ee5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiYXJiZXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjQ2MzY2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      specialty: 'Cortes modernos y diseños',
      experience: '12 años',
      rating: 4.9,
    },
    {
      id: 2,
      name: 'Miguel Ángel Torres',
      image: 'https://images.unsplash.com/photo-1547648946-2b1fd7eab923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXIlMjBjdXR0aW5nJTIwaGFpcnxlbnwxfHx8fDE3NjQ1MzMyMDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      specialty: 'Barbas y afeitado clásico',
      experience: '10 años',
      rating: 5.0,
    },
    {
      id: 3,
      name: 'Ricardo Hernández',
      image: 'https://images.unsplash.com/photo-1654097803253-d481b6751f29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJiZXIlMjB0cmltbWluZyUyMGJlYXJkfGVufDF8fHx8MTc2NDYwMzM0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      specialty: 'Estilos clásicos y vintage',
      experience: '15 años',
      rating: 4.8,
    },
  ];

  const scrollToBooking = () => {
    const element = document.getElementById('reservas');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="barberos" className="py-24 bg-dark">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-gold uppercase tracking-[0.2em] text-xs sm:text-sm">Nuestro equipo</p>
            <h2 className="text-white text-3xl sm:text-4xl font-semibold">Barberos expertos y certificados</h2>
            <p className="text-gray-400">Pasión por los detalles, técnica precisa y rituales premium para que salgas impecable en cada visita.</p>
          </div>
          <button
            onClick={scrollToBooking}
            className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gold/90 transition"
          >
            <CalendarDays className="w-5 h-5" />
            Ver disponibilidad
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-gray-dark/80 backdrop-blur rounded-xl overflow-hidden border border-gray-light/15 hover:border-gold/30 shadow-lg hover:shadow-gold/20 transition-all duration-300 group flex flex-col"
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden flex-shrink-0">
                <Image
                  src={barber.image}
                  alt={barber.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-dark via-transparent to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-grow">
                    <h4 className="text-white mb-1">{barber.name}</h4>
                    <p className="text-gold">{barber.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gold/10 px-3 py-1 rounded-full flex-shrink-0">
                    <span className="w-4 h-4 text-gold text-sm">★</span>
                    <span className="text-gold">{barber.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 text-gray-300 text-sm">
                  <span className="w-4 h-4 text-sm">🏆</span>
                  <span>{barber.experience} de experiencia</span>
                </div>

                <button 
                  onClick={scrollToBooking}
                  className="w-full bg-gold/10 text-gold px-6 py-3 rounded-lg border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-300 mt-auto"
                >
                  Ver disponibilidad
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}