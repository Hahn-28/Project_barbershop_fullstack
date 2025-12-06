import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { X, Edit2, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  specialties?: string;
  isActive: boolean;
  createdAt: string;
}

interface ProfileCardProps {
  onLogout: () => void;
  role: string;
  bookingStats: {
    confirmed: number;
    pending: number;
    complete: number;
    cancelled: number;
    total: number;
  };
}

export function ProfileCard({ onLogout, role, bookingStats }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Cargar perfil una sola vez al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const data = await api.getMyProfile();
        setProfile(data as UserProfile);
        setFormData(data as UserProfile);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("No se pudo cargar el perfil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []); // Se ejecuta una sola vez al montar

  const handleEdit = () => {
    if (isEditing) {
      // Al cancelar, restaurar los datos originales
      setFormData(profile || {});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = await api.updateMyProfile(formData);
      setProfile(updatedProfile as UserProfile);
      setFormData(updatedProfile as UserProfile);
      setIsEditing(false);
      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-8 shadow-xl flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
            <p className="text-gray-400">Cargando perfil...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-dark/60 backdrop-blur-sm border border-gray-light/10 rounded-2xl p-8 shadow-xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-light/10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Mi Perfil</h2>
              <p className="text-gray-400">Información de tu cuenta y configuración</p>
            </div>
            {profile && (
              isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="bg-gold/20 hover:bg-gold/30 text-gold rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              )
            )}
          </div>

          {/* User Info Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Información Personal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo</label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-gray-dark/80 border border-gray-light/20 text-white"
                  />
                ) : (
                  <p className="text-white text-lg font-semibold">{profile?.name || "No especificado"}</p>
                )}
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Rol</label>
                <div className="inline-block px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg">
                  <p className="text-gold font-semibold">{role}</p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Correo Electrónico</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-gray-dark/80 border border-gray-light/20 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.email || "No especificado"}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Tu número de teléfono"
                    className="bg-gray-dark/80 border border-gray-light/20 text-white"
                  />
                ) : (
                  <p className="text-white">{profile?.phone || "No especificado"}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Biografía</label>
              {isEditing ? (
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Cuéntanos sobre ti"
                  rows={4}
                  className="w-full bg-gray-dark/80 border border-gray-light/20 text-white rounded-lg p-3"
                />
              ) : (
                <p className="text-gray-300">{profile?.bio || "Sin biografía"}</p>
              )}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Estadísticas de Reservas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-dark/80 border border-gray-light/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Reservas Confirmadas</p>
                <p className="text-3xl font-bold text-green-500">{bookingStats.confirmed}</p>
              </div>
              <div className="bg-gray-dark/80 border border-gray-light/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Reservas Pendientes</p>
                <p className="text-3xl font-bold text-yellow-500">{bookingStats.pending}</p>
              </div>
              <div className="bg-gray-dark/80 border border-gray-light/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Reservas Completadas</p>
                <p className="text-3xl font-bold text-blue-500">{bookingStats.complete}</p>
              </div>
              <div className="bg-gray-dark/80 border border-gray-light/20 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Reservas Canceladas</p>
                <p className="text-3xl font-bold text-red-500">{bookingStats.cancelled}</p>
              </div>
              <div className="bg-linear-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Total de Reservas</p>
                <p className="text-3xl font-bold text-gold">{bookingStats.total}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-light/10">
            {isEditing && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gold hover:bg-gold/90 text-dark font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onLogout}
              className="bg-red-600/90 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl border border-red-500/30 shadow-lg hover:shadow-red-500/20 transition-all"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
