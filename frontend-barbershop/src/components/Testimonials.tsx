"use client";

import { useState } from 'react';

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Juan Rodríguez',
      rating: 5,
      text: 'Excelente servicio, el mejor corte que he tenido en años. Los barberos son verdaderos profesionales y el ambiente es increíble.',
      date: 'Hace 2 semanas',
    },
    {
      id: 2,
      name: 'David Martínez',
      rating: 5,
      text: 'La atención es de primera. Carlos es un artista con las tijeras. Totalmente recomendado para quien busca calidad premium.',
      date: 'Hace 1 mes',
    },
    {
      id: 3,
      name: 'Alejandro Gómez',
      rating: 5,
      text: 'Ambiente elegante y profesional. El afeitado clásico es una experiencia única. Vale cada peso.',
      date: 'Hace 3 semanas',
    },
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section id="testimonios" className="py-24 bg-gray-dark">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <p className="text-gold uppercase tracking-[0.2em] text-xs sm:text-sm">Testimonios</p>
          <h2 className="text-white text-3xl sm:text-4xl font-semibold">Lo que dicen nuestros clientes</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">Experiencias reales de quienes confían en ÉLITE para mantener su mejor versión.</p>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-gradient-to-br from-gray-medium/90 via-gray-dark to-gray-medium/90 p-12 rounded-2xl border border-gray-light/15 shadow-2xl backdrop-blur">
          <div className="absolute -top-10 right-12 text-6xl text-gold/20 select-none">“</div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex gap-1">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <span
                  key={i}
                  className="w-5 h-5 text-gold"
                >
                  ★
                </span>
              ))}
            </div>
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-sm">Cliente verificado</span>
            <span className="text-gray-400 text-sm">{currentTestimonial.date}</span>
          </div>

          <p className="text-white text-xl mb-6 leading-relaxed">
            {currentTestimonial.text}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">{currentTestimonial.name}</h4>
              <p className="text-gray-400">Cliente frecuente</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full border border-gray-light/20 hover:border-gold hover:bg-gold/10 transition-all duration-300"
            >
              <span className="text-gold text-lg">‹</span>
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-gold w-8' : 'bg-gray-light/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full border border-gray-light/20 hover:border-gold hover:bg-gold/10 transition-all duration-300"
            >
              <span className="text-gold text-lg">›</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
