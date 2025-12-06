import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/hooks/useUsers';
import { MoreVertical, Trash2 } from 'lucide-react';

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onUpdateStatus: (id: number, active: boolean) => void;
  onDelete?: (id: number) => void;
  roleFilter?: 'ALL' | 'ADMIN' | 'WORKER' | 'CLIENT';
}

export function UsersList({ users, loading, error, onRefresh, onUpdateStatus, onDelete, roleFilter = 'ALL' }: UserListProps) {
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const getStatusBadge = (isActive: boolean) => (
    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold border ${isActive ? 'bg-green-600/20 text-green-400 border-green-600/40' : 'bg-red-600/20 text-red-400 border-red-600/40'}`}>{isActive ? 'Activo' : 'Inactivo'}</span>
  );

  const filteredUsers = roleFilter === 'ALL' ? users : users.filter(u => u.role === roleFilter);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-900/30 text-red-200 border-red-700/50';
      case 'WORKER':
        return 'bg-blue-900/30 text-blue-200 border-blue-700/50';
      case 'CLIENT':
        return 'bg-green-900/30 text-green-200 border-green-700/50';
      default:
        return 'bg-gray-900/30 text-gray-200 border-gray-700/50';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'WORKER':
        return 'Trabajador';
      case 'CLIENT':
        return 'Cliente';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
        <p className="text-red-200">{error}</p>
        <Button onClick={onRefresh} className="bg-gold text-dark hover:bg-gold/90 mt-3">
          Reintentar
        </Button>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No hay usuarios disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-gray-dark border border-gray-light/20 rounded-xl p-4 hover:border-gold/50 transition-colors shadow-md"
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center shadow-lg">
                <span className="text-gold font-extrabold text-xl">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{user.name}</h3>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              {getStatusBadge(user.isActive ?? true)}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)} shadow-sm`}>{getRoleLabel(user.role)}</span>
              <button
                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                className="text-gray-400 hover:text-gold transition-colors p-1 rounded-full border border-gray-700/30 hover:border-gold/40"
                title="Opciones"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {expandedUserId === user.id && (
            <div className="mt-4 pt-4 border-t border-gray-light/20 flex gap-2 flex-wrap">
              {user.isActive ? (
                <Button
                  onClick={() => onUpdateStatus(user.id, false)}
                  className="bg-red-600/80 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg shadow"
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  onClick={() => onUpdateStatus(user.id, true)}
                  className="bg-green-600/80 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg shadow"
                >
                  Activar
                </Button>
              )}
              {onDelete && user.role !== 'ADMIN' && (
                <Button
                  onClick={() => {
                    if (window.confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
                      onDelete(user.id);
                    }
                  }}
                  className="bg-red-800/80 hover:bg-red-900 text-white text-xs px-3 py-1 rounded-lg shadow flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
