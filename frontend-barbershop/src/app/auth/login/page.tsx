"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, saveToken } from "@/lib/api";
import { Mail, Lock, Scissors, AlertCircle, Loader2, ArrowRight } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

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
          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-base flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-light/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-dark/80 text-gray-400">O continúa con email</span>
            </div>
          </div>

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