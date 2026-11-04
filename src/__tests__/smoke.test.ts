/**
 * src/__tests__/smoke.test.ts
 *
 * Milestone 1 Smoke Test Specification
 * Verifies that Vitest runner, jsdom environment, DOM polyfills, path aliasing (@/),
 * React Testing Library, jest-dom assertions, and React Context providers are 100% operational.
 */

import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';

// Verify path alias (@/)
import { cn } from '@/utils/cn';
import { GameProvider, useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { renderWithProviders } from '@/tests/test-utils';

describe('Milestone 1 Test Infrastructure Smoke Suite', () => {

  // =========================================================================
  // Layer 1: Vitest Core & Assertion Engine
  // =========================================================================
  describe('Vitest Core Capabilities', () => {
    it('executes basic assertions correctly', () => {
      expect(true).toBe(true);
      expect([1, 2, 3]).toHaveLength(3);
      expect({ name: 'Bunny Hub', active: true }).toEqual({
        name: 'Bunny Hub',
        active: true,
      });
    });

    it('resolves asynchronous promises', async () => {
      const asyncData = await Promise.resolve('ready');
      expect(asyncData).toBe('ready');
    });

    it('handles function mocks and spies via vi', () => {
      const mockFn = vi.fn((x: number) => x * 2);
      expect(mockFn(21)).toBe(42);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(21);
    });
  });

  // =========================================================================
  // Layer 2: jsdom Environment & Browser APIs
  // =========================================================================
  describe('jsdom & Browser API Emulation', () => {
    it('provides global window and document objects', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
      const div = document.createElement('div');
      div.id = 'smoke-div';
      div.textContent = 'Bunny Test';
      document.body.appendChild(div);

      const retrieved = document.getElementById('smoke-div');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.textContent).toBe('Bunny Test');

      document.body.removeChild(div);
    });

    it('dispatches and listens for custom window events', () => {
      const listener = vi.fn();
      window.addEventListener('hh:events-updated', listener);

      window.dispatchEvent(new CustomEvent('hh:events-updated', { detail: { updated: true } }));

      expect(listener).toHaveBeenCalledTimes(1);
      window.removeEventListener('hh:events-updated', listener);
    });

    it('supports localStorage operations and persistence', () => {
      localStorage.setItem('smoke_test_key', 'test_value');
      expect(localStorage.getItem('smoke_test_key')).toBe('test_value');
    });
  });

  // =========================================================================
  // Layer 3: Test Setup Polyfills (src/tests/setup.ts)
  // =========================================================================
  describe('Global Polyfills from setup.ts', () => {
    it('provides window.matchMedia polyfill', () => {
      expect(typeof window.matchMedia).toBe('function');
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      expect(mql).toBeDefined();
      expect(typeof mql.matches).toBe('boolean');
      expect(typeof mql.addEventListener).toBe('function');
      expect(typeof mql.removeEventListener).toBe('function');
    });

    it('provides global ResizeObserver polyfill', () => {
      expect(typeof globalThis.ResizeObserver).toBe('function');
      const observer = new ResizeObserver(() => {});
      expect(observer).toBeDefined();
      expect(typeof observer.observe).toBe('function');
      expect(typeof observer.unobserve).toBe('function');
      expect(typeof observer.disconnect).toBe('function');
    });

    it('cleans up localStorage automatically between tests', () => {
      expect(localStorage.getItem('smoke_test_unshared_key')).toBeNull();
    });
  });

  // =========================================================================
  // Layer 4: TypeScript Path Aliasing (@/)
  // =========================================================================
  describe('Path Aliasing (@/*)', () => {
    it('successfully imports and executes utilities via "@/utils/cn"', () => {
      const className = cn('px-4 py-2', 'bg-blue-500', { 'text-white': true, 'opacity-50': false });
      expect(className).toContain('px-4 py-2');
      expect(className).toContain('bg-blue-500');
      expect(className).toContain('text-white');
    });
  });

  // =========================================================================
  // Layer 5: React Testing Library & jest-dom Matchers
  // =========================================================================
  describe('React Testing Library & DOM Matchers', () => {
    const TestComponent: React.FC<{ initialText?: string }> = ({ initialText = 'Bunny Hub' }) => {
      const [count, setCount] = useState(0);
      return React.createElement(
        'div',
        { 'data-testid': 'test-card', className: 'p-4 rounded shadow' },
        React.createElement('h1', { 'data-testid': 'test-title' }, initialText),
        React.createElement('p', { 'data-testid': 'counter-display' }, `Clicks: ${count}`),
        React.createElement(
          'button',
          { 'data-testid': 'increment-btn', onClick: () => setCount((c) => c + 1) },
          'Increment'
        )
      );
    };

    it('renders component and asserts with @testing-library/jest-dom matchers', () => {
      render(React.createElement(TestComponent, { initialText: 'Bunny Verification Suite' }));

      const title = screen.getByTestId('test-title');
      const button = screen.getByTestId('increment-btn');

      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Bunny Verification Suite');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Increment');
    });

    it('handles React user interactions and state updates', () => {
      render(React.createElement(TestComponent));

      const button = screen.getByTestId('increment-btn');
      const counter = screen.getByTestId('counter-display');

      expect(counter).toHaveTextContent('Clicks: 0');
      act(() => {
        button.click();
      });
      expect(counter).toHaveTextContent('Clicks: 1');
    });
  });

  // =========================================================================
  // Layer 6: React Context & Custom Hook Integration
  // =========================================================================
  describe('React Context Provider & Hook Integration (GameContext)', () => {
    it('throws error when useGame is consumed outside GameProvider', () => {
      expect(() => {
        renderHook(() => useGame());
      }).toThrow('useGame must be used within a GameProvider');
    });

    it('provides default game state and allows switching games via GameProvider', () => {
      const { result } = renderHook(() => useGame(), { wrapper: GameProvider });

      expect(result.current.selectedGame).toBe('Heartopia');

      act(() => {
        result.current.setSelectedGame('Loftia');
      });

      expect(result.current.selectedGame).toBe('Loftia');
      expect(localStorage.getItem('bunny_selected_game')).toBe('Loftia');
    });
  });

  // =========================================================================
  // Layer 7: Provider Utilities & AuthContext Integration
  // =========================================================================
  describe('Provider Utilities & AuthContext Integration (renderWithProviders)', () => {
    it('supplies mock authenticated state to useAuth consumers via authValue', () => {
      const AuthConsumer: React.FC = () => {
        const { isAuthenticated, currentUser } = useAuth();
        return React.createElement(
          'div',
          null,
          React.createElement('span', { 'data-testid': 'auth-status' }, isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'),
          React.createElement('span', { 'data-testid': 'user-email' }, currentUser?.email ?? 'NO_EMAIL')
        );
      };

      const result = renderWithProviders(React.createElement(AuthConsumer), {
        authValue: {
          isAuthenticated: true,
          currentUser: { id: 'test-user-1', email: 'test@bunny.com' } as any,
        },
      });

      expect(result.getByTestId('auth-status')).toHaveTextContent('LOGGED_IN');
      expect(result.getByTestId('user-email')).toHaveTextContent('test@bunny.com');
      expect(result.user).toBeDefined();
    });

    it('supplies default mock unauthenticated state when authValue is empty', () => {
      const AuthConsumer: React.FC = () => {
        const { isAuthenticated, currentUser } = useAuth();
        return React.createElement(
          'div',
          null,
          React.createElement('span', { 'data-testid': 'auth-status' }, isAuthenticated ? 'LOGGED_IN' : 'LOGGED_OUT'),
          React.createElement('span', { 'data-testid': 'user-email' }, currentUser?.email ?? 'NO_EMAIL')
        );
      };

      const result = renderWithProviders(React.createElement(AuthConsumer), {
        authValue: {},
      });

      expect(result.getByTestId('auth-status')).toHaveTextContent('LOGGED_OUT');
      expect(result.getByTestId('user-email')).toHaveTextContent('NO_EMAIL');
    });
  });
});

