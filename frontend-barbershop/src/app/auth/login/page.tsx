"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, saveToken } from "@/lib/api";
import { Mail, Lock, Scissors, AlertCircle, Loader2, ArrowRight } from "lucide-react";


type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
};

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const res = (await api.login({ email, password })) as LoginResponse;
      const token = res?.token;
      if (!token) throw new Error("Token no recibido");
      saveToken(token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Credenciales incorrectas";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-dark flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-gold to-yellow-600 p-4 rounded-2xl shadow-2xl shadow-gold/40 transform hover:scale-110 transition-transform duration-300">
              <Scissors className="w-10 h-10 text-dark" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-white mb-3 text-4xl font-bold tracking-tight">Bienvenido a ÉLITE</h1>
          <p className="text-gray-400 text-lg">Inicia sesión para continuar</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-dark/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-light/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="group">
              <Label htmlFor="email" className="block text-white/90 mb-2 font-medium text-sm">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/70 group-focus-within:text-gold transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-xl px-12 py-3.5 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <Label htmlFor="password" className="block text-white/90 mb-2 font-medium text-sm">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/70 group-focus-within:text-gold transition-colors" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark/60 border-2 border-gray-light/20 rounded-xl px-12 py-3.5 text-white placeholder:text-gray-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gold to-yellow-600 text-dark py-3.5 rounded-xl hover:from-yellow-600 hover:to-gold transition-all duration-300 shadow-xl shadow-gold/40 hover:shadow-2xl hover:shadow-gold/50 font-semibold text-base group relative overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Iniciar sesión
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Register CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes cuenta? {" "}
              <Link href="/auth/register" className="text-gold hover:text-yellow-500 underline underline-offset-4 font-medium transition-colors">
                Crear cuenta
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}