import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { NewUser } from "@/lib/hooks/useCreateUser";

interface CreateUserFormProps {
  onSubmit: (user: NewUser) => Promise<boolean>;
  isLoading: boolean;
}

export function CreateUserForm({ onSubmit, isLoading }: CreateUserFormProps) {
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    password: "",
    role: "WORKER",
  });

  const handleSubmit = async () => {
    const success = await onSubmit(newUser);
    if (success) {
      setNewUser({ name: "", email: "", password: "", role: "WORKER" });
    }
  };

  return (
    <div className="bg-gray-dark p-6 rounded border border-gray-light/20 mb-8">
      <h3 className="text-white text-xl mb-4">Crear usuario</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white placeholder-gray-500"
          placeholder="Nombre"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <input
          className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white placeholder-gray-500"
          placeholder="Correo"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white placeholder-gray-500"
          placeholder="Contraseña"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          className="bg-dark/60 border border-gray-light/30 rounded px-3 py-2 text-white"
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as NewUser["role"] })}
        >
          <option value="WORKER">WORKER</option>
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div className="mt-4">
        <Button
          className="bg-gold text-dark hover:bg-gold/90"
          disabled={isLoading || !newUser.name || !newUser.email || !newUser.password}
          onClick={handleSubmit}
        >
          {isLoading ? "Creando..." : "Crear usuario"}
        </Button>
      </div>
    </div>
  );
}
