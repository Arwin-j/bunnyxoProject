import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdminLoginPage: React.FC = () => {
  const { signIn, isAuthenticated, isSupabase, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect straight to admin overview
  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both admin email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setError(result.error || 'Email or password is incorrect.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 py-12">
      <img
        src="/bunny-logo.webp"
        alt="Bunny Squad"
        className="bob size-16 sm:size-20 object-contain select-none"
      />

      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="card-v2 mt-6 w-full p-6 sm:p-8 space-y-4"
        style={{
          boxShadow: '0 8px 24px rgba(107, 79, 53, 0.08)',
        }}
        noValidate
      >
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center text-2xl sm:text-3xl font-heading font-bold text-[#b23a6b]">
            Admin Login
          </h1>
          {isSupabase && (
            <span className="tag-v2 text-[10px]" style={{ background: '#d9e0b4', color: '#6e7a3c' }}>
              Supabase Auth
            </span>
          )}
        </div>
        <p className="mt-1 text-center text-xs sm:text-sm text-[#8c6f55] font-sans">
          Bunny xo Keepers & Curators 🐰🌸
        </p>

        <div className="space-y-4 pt-2">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-heading font-bold uppercase tracking-wider text-[#7a5638]"
            >
              Admin Email
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#e9b3ad] bg-[#f9f4e6] px-4 py-2.5 text-sm font-sans text-[#6b4f35] placeholder:text-[#8c6f55]/60 focus:outline-none focus:ring-2 focus:ring-[#b23a6b]"
              placeholder="admin@heartopia.com"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-heading font-bold uppercase tracking-wider text-[#7a5638]"
            >
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-lpignore="true"
              data-form-type="other"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#e9b3ad] bg-[#f9f4e6] px-4 py-2.5 text-sm font-sans text-[#6b4f35] placeholder:text-[#8c6f55]/60 focus:outline-none focus:ring-2 focus:ring-[#b23a6b]"
              placeholder="••••••••"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-v2 w-full text-base py-3 min-h-[44px] cursor-pointer"
        >
          {isSubmitting ? 'Opening…' : 'Hop in 🐾'}
        </button>

        {error && (
          <p
            id="login-error"
            role="alert"
            className="mt-4 rounded-xl bg-[#fbd5e1] border border-[#b23a6b]/30 px-3 py-2 text-center text-xs font-bold text-[#b23a6b]"
          >
            ⚠️ {error}
          </p>
        )}
      </form>
    </main>
  );
};

export default AdminLoginPage;
