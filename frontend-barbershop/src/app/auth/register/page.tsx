"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, saveToken } from "@/lib/api";

type RegisterResponse = {
  token?: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirm) {
      setError("Por favor completa todos los campos");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const res = (await api.register({ name, email, password })) as RegisterResponse;
      const token = res.token;
      if (token) saveToken(token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo crear la cuenta";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gold p-3 rounded shadow-lg shadow-gold/30">
              <span className="w-8 h-8 text-dark text-2xl">✂️</span>
            </div>
          </div>
          <h2 className="text-white mb-2 text-3xl">Crear cuenta</h2>
          <p className="text-gray-300">Regístrate para comenzar</p>
        </div>

        {/* Register Form */}
        <div className="bg-gray-dark p-8 rounded-lg border border-gray-light/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name" className="block text-white/90 mb-2">
                Nombre
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold">👤</span>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="block text-white/90 mb-2">
                Correo electrónico
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold">📧</span>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none transition-colors"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="block text-white/90 mb-2">
                Contraseña
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold">🔒</span>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirm" className="block text-white/90 mb-2">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold">🔒</span>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-lg px-12 py-3 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 flex items-center gap-2">
                <span className="w-5 h-5 text-red-500 flex-shrink-0">⚠️</span>
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gold text-dark py-3 rounded-lg hover:bg-gold/90 transition-all duration-300 shadow-lg shadow-gold/30"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta? <a href="/auth/login" className="text-gold underline">Inicia sesión</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
