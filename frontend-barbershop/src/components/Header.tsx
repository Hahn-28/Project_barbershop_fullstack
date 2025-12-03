"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export function Header() {
  const [hasSession, setHasSession] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !!localStorage.getItem("auth_token");
    } catch {
      return false;
    }
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth_token") {
        setHasSession(!!e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
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
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('inicio')}>
            <div className="bg-gold p-2 rounded">
              <span className="w-6 h-6 text-dark text-lg">✂️</span>
            </div>
            <div>
              <h3 className="text-white">ÉLITE</h3>
              <p className="text-xs text-gold">Premium Barber</p>
            </div>
          </div>

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
          {mounted && (
            <Link
              href={hasSession ? "/dashboard" : "/auth/login"}
              className="bg-gold text-dark px-6 py-2.5 rounded hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-gold/50"
              suppressHydrationWarning
            >
              {hasSession ? "Dashboard" : "Iniciar sesión"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
