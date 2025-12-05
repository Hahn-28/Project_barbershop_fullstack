"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Clock, BadgeCheck, Sparkles } from "lucide-react";

type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number;
};

// Mapeo de iconos según el tipo de servicio
const getServiceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('corte') || lowerName.includes('haircut')) return Scissors;
  if (lowerName.includes('barba') || lowerName.includes('beard')) return Sparkles;
  if (lowerName.includes('afeitado') || lowerName.includes('shave')) return BadgeCheck;
  return Scissors; // Por defecto
};

// Estimación de duración según el servicio (puedes modificar esto)
const getEstimatedDuration = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('completo') || lowerName.includes('premium')) return '60 min';
  if (lowerName.includes('barba')) return '30 min';
  if (lowerName.includes('corte')) return '45 min';
  return '30 min'; // Por defecto
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getServices() as Service[];
        setServices(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "No se pudo cargar servicios";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollToBooking = () => {
    const element = document.getElementById('reservas');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Cargando servicios...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => {
        const IconComponent = getServiceIcon(service.name);
        const duration = service.duration || getEstimatedDuration(service.name);
        
        return (
          <Card 
            key={service.id} 
            className="bg-gray-medium border border-gray-light/20 hover:border-gold/50 transition-all duration-300 overflow-hidden group"
          >
            {/* Header con icono */}
            <div className="bg-gray-dark p-6 border-b border-gray-light/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gold/10 rounded-full flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <IconComponent className="w-7 h-7 text-gold" />
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{duration}</span>
                </div>
              </div>
              <h3 className="text-white text-xl font-semibold">{service.name}</h3>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {service.description ? (
                <p className="text-gray-300 mb-6 min-h-[60px] leading-relaxed">
                  {service.description}
                </p>
              ) : (
                <p className="text-gray-400 mb-6 min-h-[60px] italic">
                  Servicio profesional de barbería
                </p>
              )}

              {/* Características */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <BadgeCheck className="w-4 h-4 text-gold" />
                  <span>Profesionales certificados</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Productos premium</span>
                </div>
              </div>

              {/* Precio y botón */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-light/20">
                <div>
                  <p className="text-gray-400 text-sm">Precio</p>
                  <p className="text-gold text-2xl font-bold">S/ {service.price.toFixed(2)}</p>
                </div>
                <Button 
                  onClick={scrollToBooking}
                  className="bg-gold text-dark hover:bg-gold/90 transition-all duration-300 shadow-lg hover:shadow-gold/50"
                >
                  Reservar
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}