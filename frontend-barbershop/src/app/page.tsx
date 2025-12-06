"use client";
import Image from "next/image";
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import Services from '../components/Services';
import { Barbers } from '../components/Barbers';
import { BookingModule } from '../components/BookingModule';
import { Testimonials } from '../components/Testimonials';
import { Footer } from '../components/Footer';
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <section id="servicios" className="bg-gray-dark py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gold uppercase tracking-[0.2em] text-xs sm:text-sm">Servicios</p>
            <h2 className="text-white text-3xl sm:text-4xl font-semibold">Cortes y rituales a la altura</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Selecciona tu servicio favorito con productos premium y agenda en minutos.</p>
          </div>
          <Services />
        </div>
      </section>
      <Barbers />
      <BookingModule />
      <Testimonials />
      <Footer />
    </>
  );
}
