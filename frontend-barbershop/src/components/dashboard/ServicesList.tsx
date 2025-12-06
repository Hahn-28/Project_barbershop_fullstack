import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Service } from '@/lib/hooks/useServices';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

interface ServicesListProps {
  services: Service[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onCreate: (data: { name: string; description?: string; price: number; duration?: number }) => Promise<boolean>;
  onUpdate: (id: number, data: { name?: string; description?: string; price?: number; duration?: number }) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function ServicesList({ services, loading, error, onRefresh, onCreate, onUpdate, onDelete }: ServicesListProps) {
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', duration: '' });
    setFormError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.price) {
      setFormError('Nombre y precio son requeridos');
      return;
    }

    const success = await onCreate({
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      duration: formData.duration ? parseInt(formData.duration) : undefined,
    });

    if (success) {
      resetForm();
      setShowCreateForm(false);
    }
  };

  const handleUpdate = async (id: number, e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const updates: { name?: string; description?: string; price?: number; duration?: number } = {};
    if (formData.name) updates.name = formData.name;
    if (formData.description) updates.description = formData.description;
    if (formData.price) updates.price = parseFloat(formData.price);
    if (formData.duration) updates.duration = parseInt(formData.duration);

    const success = await onUpdate(id, updates);

    if (success) {
      resetForm();
      setEditingId(null);
      setExpandedServiceId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      await onDelete(id);
      setExpandedServiceId(null);
    }
  };

  const startEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration: service.duration?.toString() || '',
    });
    setEditingId(service.id);
    setExpandedServiceId(service.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Cargando servicios...</div>
      </div>
    );
  }

  if (error && !showCreateForm) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
        <p className="text-red-200">{error}</p>
        <Button onClick={onRefresh} className="bg-gold text-dark hover:bg-gold/90 mt-3">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Botón crear servicio */}
      {!showCreateForm && (
        <Button onClick={() => setShowCreateForm(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Crear Servicio
        </Button>
      )}

      {/* Formulario crear */}
      {showCreateForm && (
        <div className="bg-gray-dark border border-gold/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gold font-bold">Nuevo Servicio</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-3">
            {formError && (
              <div className="bg-red-900/20 border border-red-700/50 rounded p-2">
                <p className="text-red-200 text-sm">{formError}</p>
              </div>
            )}

            <div>
              <Label className="text-white text-sm">Nombre *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Corte de cabello"
                className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <Label className="text-white text-sm">Descripción</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del servicio"
                className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-sm">Precio *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Duración (min)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="30"
                  className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-gold text-dark hover:bg-gold/90 font-bold">
                Crear
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de servicios */}
      {services.length === 0 ? (
        <div className="text-center py-12 bg-gray-dark border border-gray-light/20 rounded-lg">
          <p className="text-gray-400">No hay servicios disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-dark border border-gray-light/20 rounded-xl p-4 hover:border-gold/50 transition-colors shadow-md hover:scale-[1.02] duration-200"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center shadow-lg">
                    <span className="text-gold font-extrabold text-xl">$</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{service.name}</h3>
                    {service.description && (
                      <p className="text-xs text-gray-400 truncate">{service.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-gold font-bold">${service.price.toFixed(2)}</p>
                    {service.duration && (
                      <p className="text-xs text-gray-400">{service.duration} min</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(service)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-full border border-blue-400/30 hover:border-blue-400/60"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full border border-red-400/30 hover:border-red-400/60"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulario editar */}
              {editingId === service.id && expandedServiceId === service.id && (
                <div className="mt-4 pt-4 border-t border-gray-light/20">
                  <form onSubmit={(e) => handleUpdate(service.id, e)} className="space-y-3">
                    {formError && (
                      <div className="bg-red-900/20 border border-red-700/50 rounded p-2">
                        <p className="text-red-200 text-sm">{formError}</p>
                      </div>
                    )}

                    <div>
                      <Label className="text-white text-sm">Nombre</Label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-gray-dark/50 border-gray-light/30 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white text-sm">Descripción</Label>
                      <Input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-gray-dark/50 border-gray-light/30 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm">Precio</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="bg-gray-dark/50 border-gray-light/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Duración (min)</Label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          className="bg-gray-dark/50 border-gray-light/30 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button type="submit" className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-lg shadow">
                        Guardar
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setExpandedServiceId(null);
                          resetForm();
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
