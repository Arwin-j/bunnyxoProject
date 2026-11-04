import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, AuthContext, AuthContextType } from '../hooks/useAuth';
import { GameProvider, GameName } from '../hooks/useGame';

// 1. Discord Presence Test Context & Default Values
// Provides a resilient mock provider for M1 that bridges to M2 DiscordPresenceContext
export interface DiscordPresenceData {
  onlineCount: number | null;
  serverName: string;
}

export const defaultDiscordPresence: DiscordPresenceData = {
  onlineCount: 42,
  serverName: 'Bunny xo',
};

export const DiscordPresenceTestContext = React.createContext<DiscordPresenceData>(
  defaultDiscordPresence
);

export const DiscordPresenceTestProvider: React.FC<{
  value?: Partial<DiscordPresenceData>;
  children: ReactNode;
}> = ({ value, children }) => {
  const merged = { ...defaultDiscordPresence, ...value };
  return (
    <DiscordPresenceTestContext.Provider value={merged}>
      {children}
    </DiscordPresenceTestContext.Provider>
  );
};

// 2. Custom Mock Auth Provider for direct state injection in tests
// Export MockAuthContext as an alias to AuthContext for backwards compatibility
export const MockAuthContext = AuthContext;

export const MockAuthProvider: React.FC<{
  value?: Partial<AuthContextType>;
  children: ReactNode;
}> = ({ value = {}, children }) => {
  const defaultAuth: AuthContextType = {
    isAuthenticated: false,
    isSupabase: false,
    currentUser: null,
    loading: false,
    signIn: async () => ({ success: true }),
    signOut: async () => {},
  };

  return (
    <AuthContext.Provider value={{ ...defaultAuth, ...value }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Extended Render Options
export interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  /** Initial route entry, e.g. '/admin/overview' or '/home' */
  route?: string;
  /** Initial entries array for MemoryRouter */
  initialEntries?: string[];
  /** Pre-seeded active game for GameProvider */
  initialGame?: GameName;
  /** Override auth state for protected routes or admin testing */
  authValue?: Partial<AuthContextType>;
  /** Override Discord presence counts */
  discordPresence?: Partial<DiscordPresenceData>;
}

export interface RenderWithProvidersResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

/**
 * Custom render helper that wraps the component with:
 * - MemoryRouter (with configurable route)
 * - AuthProvider (or MockAuthProvider if authValue provided)
 * - GameProvider (pre-seeded with initialGame)
 * - DiscordPresenceTestProvider (for live presence mocking)
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ExtendedRenderOptions = {}
): RenderWithProvidersResult {
  const {
    route = '/',
    initialEntries = [route],
    initialGame = 'Heartopia',
    authValue,
    discordPresence,
    ...renderOptions
  } = options;

  // Pre-seed localStorage for GameProvider
  try {
    localStorage.setItem('bunny_selected_game', initialGame);
  } catch {
    // Ignore storage errors in test setup
  }

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {authValue ? (
          <MockAuthProvider value={authValue}>
            <GameProvider>
              <DiscordPresenceTestProvider value={discordPresence}>
                {children}
              </DiscordPresenceTestProvider>
            </GameProvider>
          </MockAuthProvider>
        ) : (
          <AuthProvider>
            <GameProvider>
              <DiscordPresenceTestProvider value={discordPresence}>
                {children}
              </DiscordPresenceTestProvider>
            </GameProvider>
          </AuthProvider>
        )}
      </MemoryRouter>
    );
  };

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  } as RenderWithProvidersResult;
}

// Re-export all React Testing Library and User Event utilities
export * from '@testing-library/react';
export { userEvent };
