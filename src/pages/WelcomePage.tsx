import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const STRIPE_DURATION = 1400;

const StripeOverlay: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -inset-[60vmax] z-50 flex rotate-45 overflow-hidden"
    >
      {Array.from({ length: 9 }, (_, idx) => (
        <div
          key={idx}
          className="stripe h-full flex-1"
          style={{
            backgroundColor: idx % 2 ? 'var(--card)' : 'var(--primary)',
            animationDelay: `${idx * 60}ms`,
          }}
        />
      ))}
    </div>
  );
};

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!transitioning) return;
    const timer = setTimeout(() => {
      navigate('/home');
    }, STRIPE_DURATION);
    return () => clearTimeout(timer);
  }, [transitioning, navigate]);

  const handleEnter = () => {
    if (transitioning) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      navigate('/home');
      return;
    }
    setTransitioning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background selection:bg-primary selection:text-foreground">
      <div className="flex justify-end p-4">
        <Link
          to="/admin/login"
          aria-label="Admin login"
          title="Admin login"
          className="sticker shadow-ink rounded-full p-2.5 text-xl hover:bg-accent active:translate-y-0.5 transition-transform"
        >
          <span aria-hidden="true">🔧</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-16 text-center">
        <img
          src="/welcome-bunny.webp"
          alt="Bunny Squad"
          className="bob size-32 sm:size-40 object-contain select-none"
        />

        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl text-foreground">
          Welcome Bunnies
        </h1>

        <button
          type="button"
          onClick={handleEnter}
          disabled={transitioning}
          className="sticker shadow-berry mt-6 h-auto cursor-pointer rounded-full px-10 py-3 text-2xl font-semibold hover:bg-accent active:translate-y-0.5 disabled:opacity-50 transition-all"
        >
          Enter
        </button>

        <p className="mt-3 text-sm text-muted-foreground font-medium">
          Hop on in — the garden's waiting 🌷
        </p>
      </div>

      {transitioning && <StripeOverlay />}
    </div>
  );
};
