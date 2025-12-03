import Image from 'next/image';

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
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-gold uppercase tracking-wider">Nuestro Equipo</span>
          </div>
          <h2 className="text-white mb-4">Barberos Expertos</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Profesionales certificados con años de experiencia y pasión por su arte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="bg-gray-dark rounded-lg overflow-hidden border border-gray-light/20 hover:border-gold/30 transition-all duration-300 group flex flex-col"
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

                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <span className="w-4 h-4 text-sm">🏆</span>
                  <span>{barber.experience} de experiencia</span>
                </div>

                <button 
                  onClick={scrollToBooking}
                  className="w-full bg-gold/10 text-gold px-6 py-3 rounded border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-300 mt-auto"
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