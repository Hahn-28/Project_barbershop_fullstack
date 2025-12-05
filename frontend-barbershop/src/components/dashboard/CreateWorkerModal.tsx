import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CreateWorkerModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<boolean>;
}

export function CreateWorkerModal({ isOpen, isLoading, onClose, onSubmit }: CreateWorkerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const result = await onSubmit({ name, email, password });
      if (result) {
        setName('');
        setEmail('');
        setPassword('');
        onClose();
        toast.success('Trabajador creado exitosamente');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear trabajador');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-dark border border-gold/30 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-light/20">
          <h2 className="text-gold text-xl font-bold">Crear Nuevo Trabajador</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="worker-name" className="text-white mb-2 block">Nombre Completo</Label>
            <Input
              id="worker-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={isLoading}
              className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="worker-email" className="text-white mb-2 block">Correo Electrónico</Label>
            <Input
              id="worker-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@barber.com"
              disabled={isLoading}
              className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <Label htmlFor="worker-password" className="text-white mb-2 block">Contraseña</Label>
            <Input
              id="worker-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className="bg-gray-dark/50 border-gray-light/30 text-white placeholder-gray-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gold text-dark hover:bg-gold/90 font-bold"
            >
              {isLoading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
