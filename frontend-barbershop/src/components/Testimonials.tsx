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
    <section className="py-24 bg-dark">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-gold uppercase tracking-wider">Testimonios</span>
          </div>
          <h2 className="text-white mb-4">Lo que dicen nuestros clientes</h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-gray-dark p-12 rounded-lg border border-gray-light/20">
          <span className="w-12 h-12 text-gold/20 mb-6 text-4xl leading-none">
            “
          </span>

          <div className="mb-6">
            <div className="flex gap-1 mb-4">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <span
                  key={i}
                  className="w-5 h-5 text-gold"
                >
                  ★
                </span>
              ))}
            </div>

            <p className="text-white text-xl mb-6 leading-relaxed">
              {currentTestimonial.text}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white">{currentTestimonial.name}</h4>
                <p className="text-gray-400">{currentTestimonial.date}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
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
