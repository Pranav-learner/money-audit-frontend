'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-primary via-primary to-accent flex items-center justify-center mb-8 shadow-2xl relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-4">MoneyAudit</h1>
        <p className="text-muted text-xl max-w-sm">Smart tracking for your finances</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-12 space-y-10">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-colors group-focus-within:text-primary">
              <Mail className="w-5 h-5 text-muted" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              style={{ paddingLeft: '3.5rem' }}
              id="login-email"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-colors group-focus-within:text-primary">
              <Lock className="w-5 h-5 text-muted" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field"
              style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
              id="login-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center py-4 text-lg font-bold disabled:opacity-60 shadow-lg"
          id="login-submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-base text-muted pt-2">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
