import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/hooks/useUsers';
import { MoreVertical } from 'lucide-react';

interface UserListProps {
  users: User[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onUpdateStatus: (id: number, active: boolean) => void;
  roleFilter?: 'ALL' | 'ADMIN' | 'WORKER' | 'CLIENT';
}

export function UsersList({ users, loading, error, onRefresh, onUpdateStatus, roleFilter = 'ALL' }: UserListProps) {
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

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
    <div className="space-y-2">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-gray-dark border border-gray-light/20 rounded-lg p-4 hover:border-gold/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <span className="text-gold font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              <button
                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                className="text-gray-400 hover:text-gold transition-colors p-1"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {expandedUserId === user.id && (
            <div className="mt-4 pt-4 border-t border-gray-light/20 flex gap-2">
              {user.isActive ? (
                <Button
                  onClick={() => onUpdateStatus(user.id, false)}
                  className="bg-red-600/80 hover:bg-red-700 text-white text-xs px-3 py-1"
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  onClick={() => onUpdateStatus(user.id, true)}
                  className="bg-green-600/80 hover:bg-green-700 text-white text-xs px-3 py-1"
                >
                  Activar
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
