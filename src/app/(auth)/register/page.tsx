'use client';

import { Eye, EyeOff, Lock, Mail, Phone, User, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import type { ApiError } from '@/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { toast } from '@/shared/components/ui/toast';
import { useZodForm } from '@/shared/lib/use-zod-form';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number').max(20),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useZodForm(registerSchema, {
    defaultValues: { name: '', email: '', phone: '', password: '' },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (values: RegisterValues) => {
    try {
      await registerUser(values.name, values.email, values.phone, values.password);
      toast.success('Account created — welcome!');
      router.push('/dashboard');
    } catch (err) {
      toast.error((err as ApiError)?.message ?? 'Registration failed. Please try again.');
    }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <Wallet className="size-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start tracking your finances with Money Audit</p>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <h2>Sign up</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <FormItem>
              <FormLabel htmlFor="register-name" required>
                Full name
              </FormLabel>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="register-name"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className="pl-9"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
              </div>
              <FormMessage>{errors.name?.message}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="register-email" required>
                Email address
              </FormLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
              </div>
              <FormMessage>{errors.email?.message}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="register-phone" required>
                Phone number
              </FormLabel>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="register-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="pl-9"
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                />
              </div>
              <FormMessage>{errors.phone?.message}</FormMessage>
            </FormItem>

            <FormItem>
              <FormLabel htmlFor="register-password" required>
                Password
              </FormLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="px-9"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FormMessage>{errors.password?.message}</FormMessage>
            </FormItem>

            <Button id="register-submit" type="submit" className="w-full" loading={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
