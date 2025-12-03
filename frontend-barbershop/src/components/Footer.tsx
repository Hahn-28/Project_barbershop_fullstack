export function Footer() {
  return (
    <footer id="contacto" className="bg-gray-dark border-t border-gray-light/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gold p-2 rounded">
                <span className="w-6 h-6 text-dark text-lg">✂️</span>
              </div>
              <div>
                <h3 className="text-white">ÉLITE</h3>
                <p className="text-xs text-gold">Premium Barber</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Barbería premium dedicada a ofrecer servicios de alta calidad con estilo y profesionalismo.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-gray-light/20 flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300"
              >
                <span className="w-5 h-5 text-gold text-lg">f</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-gray-light/20 flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300"
              >
                <span className="w-5 h-5 text-gold text-lg">◎</span>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full border border-gray-light/20 flex items-center justify-center hover:border-gold hover:bg-gold/10 transition-all duration-300"
              >
                <span className="w-5 h-5 text-gold text-lg">𝕏</span>
              </a>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h4 className="text-white mb-6">Horarios de Atención</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 text-gold mt-0.5 flex-shrink-0">⏰</span>
                <div>
                  <p>Lunes - Viernes</p>
                  <p className="text-white">9:00 AM - 8:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 text-gold mt-0.5 flex-shrink-0">⏰</span>
                <div>
                  <p>Sábados</p>
                  <p className="text-white">9:00 AM - 6:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 text-gold mt-0.5 flex-shrink-0">⏰</span>
                <div>
                  <p>Domingos</p>
                  <p className="text-white">Cerrado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white mb-6">Contacto</h4>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 text-gold mt-0.5 flex-shrink-0">📍</span>
                <p>Av. Principal 123<br />Centro, Ciudad</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-gold flex-shrink-0">📞</span>
                <a href="tel:+525512345678" className="hover:text-gold transition-colors">
                  +52 55 1234 5678
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-gold flex-shrink-0">✉️</span>
                <a href="mailto:info@elitebarber.com" className="hover:text-gold transition-colors">
                  info@elitebarber.com
                </a>
              </div>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h4 className="text-white mb-6">Enlaces Rápidos</h4>
            <div className="space-y-3">
              <a href="#inicio" className="block text-gray-400 hover:text-gold transition-colors">
                Inicio
              </a>
              <a href="#servicios" className="block text-gray-400 hover:text-gold transition-colors">
                Servicios
              </a>
              <a href="#barberos" className="block text-gray-400 hover:text-gold transition-colors">
                Barberos
              </a>
              <a href="#reservas" className="block text-gray-400 hover:text-gold transition-colors">
                Reservas
              </a>
              <a href="#contacto" className="block text-gray-400 hover:text-gold transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-light/20 text-center text-gray-400">
          <p>&copy; 2024 ÉLITE Premium Barber. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
