"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Service = {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number;
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

  if (loading) return <p className="text-white">Cargando servicios...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s) => (
        <Card key={s.id} className="p-4 bg-gray-dark border border-gray-light/20">
          <h3 className="text-white text-lg font-semibold mb-2">{s.name}</h3>
          {s.description && <p className="text-gray-300 mb-2">{s.description}</p>}
          <p className="text-gold font-medium mb-4">S/ {s.price.toFixed(2)}</p>
          <Button className="bg-gold text-dark hover:bg-gold/90">Reservar</Button>
        </Card>
      ))}
    </div>
  );
}