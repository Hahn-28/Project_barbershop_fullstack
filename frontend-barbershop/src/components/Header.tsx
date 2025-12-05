"use client";
import Link from "next/link";
import { useAuthToken } from "@/lib/useAuthToken";
import { Scissors } from "lucide-react";
export function Header() {
  // Subscribe to auth token changes without setState in effects
  const hasSession = useAuthToken();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-sm border-b border-gray-light/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            aria-label="Ir al inicio"
            className="flex items-center gap-3 cursor-pointer bg-transparent p-0 border-0"
            onClick={() => scrollToSection('inicio')}
          >
            <div className="bg-gold p-2 rounded">
              <Scissors className="w-6 h-6 text-dark" />
            </div>
            <div>
              <h3 className="text-white">ÉLITE</h3>
              <p className="text-xs text-gold">Premium Barber</p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('inicio')} className="text-white hover-gold transition-colors">
              Inicio
            </button>
            <button onClick={() => scrollToSection('servicios')} className="text-white hover-gold transition-colors">
              Servicios
            </button>
            <button onClick={() => scrollToSection('barberos')} className="text-white hover-gold transition-colors">
              Barberos
            </button>
            <button onClick={() => scrollToSection('reservas')} className="text-white hover-gold transition-colors">
              Reservas
            </button>
            <button onClick={() => scrollToSection('contacto')} className="text-white hover-gold transition-colors">
              Contacto
            </button>
            <button onClick={() => scrollToSection('reservas')} className="text-white hover-gold transition-colors">
              Reservar ahora
            </button>
          </nav>

          {/* CTA Button: Login/Dashboard */}
          <Link
            href={hasSession ? "/dashboard" : "/auth/login"}
            className="bg-gold text-dark px-6 py-2.5 rounded hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-gold/50"
          >
            {hasSession ? "Dashboard" : "Iniciar sesión"}
          </Link>
        </div>
      </div>
    </header>
  );
}
