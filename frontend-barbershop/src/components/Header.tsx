"use client";
import Link from "next/link";
import { useAuthToken } from "@/lib/useAuthToken";
import { getRoleFromToken, getNameFromToken } from "@/lib/auth";
import { Scissors } from "lucide-react";
export function Header() {
  // Subscribe to auth token changes without setState in effects
  const hasSession = useAuthToken();
  // Obtener nombre y rol si hay sesión
  const userName = hasSession ? getNameFromToken() : null;
  const userRole = hasSession ? getRoleFromToken() : null;
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-dark via-gray-900 to-dark/90 backdrop-blur-md border-b border-gold/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <button
            type="button"
            aria-label="Ir al inicio"
            className="flex items-center gap-3 cursor-pointer bg-transparent p-0 border-0 group"
            onClick={() => scrollToSection('inicio')}
          >
            <div className="bg-gold p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
              <Scissors className="w-7 h-7 text-dark" />
            </div>
            <div className="ml-1">
              <h3 className="text-white text-xl font-extrabold tracking-wide drop-shadow">ÉLITE</h3>
              <p className="text-xs text-gold font-semibold tracking-widest uppercase">Premium Barber</p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('inicio')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Inicio
            </button>
            <button onClick={() => scrollToSection('servicios')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Servicios
            </button>
            <button onClick={() => scrollToSection('barberos')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Barberos
            </button>
            <button onClick={() => scrollToSection('reservas')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Reservas
            </button>
            <button onClick={() => scrollToSection('testimonios')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Testimonios
            </button>
            <button onClick={() => scrollToSection('contacto')} className="text-white hover:text-gold transition-colors font-medium px-2 py-1 rounded hover:bg-gold/10">
              Contacto
            </button>
            <button onClick={() => scrollToSection('reservas')} className="text-gold bg-dark/70 border border-gold/40 px-3 py-1 rounded-lg font-bold shadow hover:bg-gold/90 hover:text-dark transition-all">
              Reservar ahora
            </button>
          </nav>

          {/* Usuario y CTA */}
          <div className="flex items-center gap-4">
            {hasSession && (
              <div className="flex flex-col items-end mr-2 bg-dark/80 px-3 py-1 rounded-lg border border-gold/40 shadow-gold/10 min-w-[90px]">
                <span className="text-gold font-semibold text-sm truncate max-w-[120px]">{userName}</span>
                <span className="text-xs text-gray-300 italic">{userRole}</span>
              </div>
            )}
            <Link
              href={hasSession ? "/dashboard" : "/auth/login"}
              className="bg-gold text-dark px-6 py-2.5 rounded-lg hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-gold/50 font-bold border-2 border-gold/80"
            >
              {hasSession ? "Dashboard" : "Iniciar sesión"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
