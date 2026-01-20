'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      router.push('/login?registered=true');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F5F0] via-white to-[#E8F0E9] py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A7C59] to-[#1E3A2F] shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-[rgb(38,38,38)]">Sage IA</h1>
          <p className="text-[rgb(134,134,146)] mt-1">Crie sua conta gratuita</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[rgba(79,89,102,0.08)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[rgb(38,38,38)] mb-1.5">
                Nome
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,134,146)]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(134,134,146)] focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C5920] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(38,38,38)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,134,146)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(134,134,146)] focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C5920] transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(38,38,38)] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,134,146)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(134,134,146)] focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C5920] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(38,38,38)] mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,134,146)]" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-[rgb(249,250,251)] border border-[rgba(79,89,102,0.08)] rounded-xl text-[rgb(38,38,38)] placeholder-[rgb(134,134,146)] focus:outline-none focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C5920] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(134,134,146)] hover:text-[rgb(38,38,38)] transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#4A7C59] to-[#1E3A2F] text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#4A7C5930]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar Conta
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(79,89,102,0.08)]" />
            <span className="text-xs text-[rgb(134,134,146)]">ou</span>
            <div className="flex-1 h-px bg-[rgba(79,89,102,0.08)]" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-[rgb(134,134,146)]">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#4A7C59] hover:text-[#1E3A2F] font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[rgb(134,134,146)] mt-6">
          Ao criar uma conta, você concorda com nossos Termos de Uso
        </p>
      </div>
    </div>
  );
}
