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
        className="sticker shadow-berry mt-6 w-full rounded-[32px_40px_28px_44px] p-6 sm:p-8 border-[3px] border-foreground bg-card"
        noValidate
      >
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-center text-3xl font-semibold">Admin Login</h1>
          {isSupabase && (
            <span className="rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Supabase Auth
            </span>
          )}
        </div>
        <p className="mt-1 text-center text-sm text-muted-foreground font-mono">
          BunnySite keepers only 🐰
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-sm font-semibold font-mono text-foreground"
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
              className="mt-1 w-full rounded-2xl border-[3px] border-foreground bg-background px-4 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@heartopia.com"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold font-mono text-foreground"
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
              className="mt-1 w-full rounded-2xl border-[3px] border-foreground bg-background px-4 py-2 text-base font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="sticker shadow-ink mt-6 h-auto w-full cursor-pointer rounded-full border-[3px] border-foreground bg-primary px-6 py-2.5 text-xl font-semibold hover:bg-accent active:translate-y-0.5 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Opening…' : 'Hop in 🐾'}
        </button>

        {error && (
          <p
            id="login-error"
            role="alert"
            className="mt-4 rounded-xl border-2 border-primary bg-primary/20 px-3 py-2 text-center text-sm font-semibold text-foreground"
          >
            ⚠️ {error}
          </p>
        )}
      </form>
    </main>
  );
};

export default AdminLoginPage;
