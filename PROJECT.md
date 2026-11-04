# Project: Bunny Hub Context Testing & Verification Suite

## Architecture
- **Framework & Runtime**: React 18.3, Vite 6, TypeScript 5.6, Node 26.
- **Application State Architecture**:
  - Global React Contexts: `AuthContext` (Supabase auth & session), `GameContext` (selected game persisted to localStorage), `DiscordPresenceContext` (singleton polling & presence counter).
  - Domain Custom Hooks: `useEvents`, `useInteractivePins`, `useRedemptionCodes`, `useCommunitySpotlights`, `useHomeUpdates`, `useMapCategories`, `useCountdown`, `useNow`, `useFeedPosts`.
  - Consuming Components: Public pages (`Header`, `HomePage`, `EventsPage`, `FeedPage`, `MapPage`, `RedemptionCodesPage`), Modals (`SubmitSpotlightModal`, `EventDetailsModal`), Admin portal (`AdminLayout`, `AdminHeader`, `AdminLoginPage`, `AdminOverviewPage`, `AdminEditPage`, `AdminEditCodesPage`, `AdminEditMapsPage`, `AdminEditHomePage`).
- **Testing Architecture**:
  - Test Runner: Vitest with jsdom environment.
  - Testing Utilities: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`.
  - Custom Execution Scripts: `scripts/test-runner.mjs` (general test runner), `scripts/test-contexts.mjs` (context-specific test runner printing verification matrix).
  - npm script shortcuts: `test`, `test:contexts`, `test:coverage`, `test:watch`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Test Infrastructure & Config | Vitest, jsdom, RTL setup, `vitest.config.ts`, `src/tests/setup.ts`, `src/tests/test-utils.tsx` | M1 | R1, R2, Survey 3 |
| 2 | Custom Test Execution Commands & Scripts | `scripts/test-runner.mjs`, `scripts/test-contexts.mjs`, npm scripts | M1 | R2, Survey 3 |
| 3 | DiscordPresenceContext Singleton | Shared context provider, relaxed 120s polling, Header + HomePage integration | M2 | Tester Report Defect 1, R1 |
| 4 | Instagram Feed Cache & Rate Shielding | 30-min TTL cache check in `useFeedPosts.ts` | M2 | Tester Report Defect 2 |
| 5 | Timeout Relaxation & Concurrency Resilience | 8000ms timeout in `supabaseEventsRepository.ts` & `useInteractivePins.ts` | M2 | Tester Report Defect 3 |
| 6 | AuthContext & Provider Tests | Automated tests for `AuthContext`, `AuthProvider`, `useAuth` | M3 | R1, Survey 1 |
| 7 | GameContext & Provider Tests | Automated tests for `GameContext`, `GameProvider`, `useGame` | M3 | R1, Survey 1 |
| 8 | DiscordPresenceContext Tests | Automated tests for `DiscordPresenceContext`, `DiscordPresenceProvider`, `useDiscordPresence` | M3 | R1, Survey 1 |
| 9 | Events & Map Custom Hooks Tests | Automated tests for `useEvents`, `useInteractivePins`, `useMapCategories` | M4 | R1, Survey 1 |
| 10 | Content & Community Custom Hooks Tests | Automated tests for `useCommunitySpotlights`, `useHomeUpdates`, `useRedemptionCodes`, `useFeedPosts`, `useCountdown`, `useNow` | M4 | R1, Survey 1 |
| 11 | Public Consuming Components Tests | Automated tests for `Header`, `HomePage` verifying context consumption & interactions | M5 | R1, Survey 2 |
| 12 | Admin Consuming Components Tests | Automated tests for `AdminLoginPage`, `AdminLayout`, `AdminHeader` verifying `AuthContext` consumption | M5 | R1, Survey 2 |
| 13 | E2E Testing Track & Integration | Opaque-box full user workflow test suite (Tiers 1-4), publishing `TEST_READY.md` | M6 | R1, R2, Dual Track |
| 14 | Adversarial Hardening & Forensic Audit | Adversarial test coverage hardening (Tier 5) + Forensic integrity audit | M7 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Test Infrastructure & Custom Runner Scripts | Vitest, jsdom, RTL, `vitest.config.ts`, `src/tests/setup.ts`, `src/tests/test-utils.tsx`, `scripts/test-runner.mjs`, `scripts/test-contexts.mjs`, npm scripts | none | IN_PROGRESS |
| M2 | Context Architecture & Rate-Limit Shielding | `DiscordPresenceContext.tsx`, `App.tsx`, `useDiscordPresence.ts`, `useFeedPosts.ts`, timeout relaxation | none | PLANNED |
| M3 | State Contexts & Providers Automated Tests | Unit & integration tests for AuthContext, GameContext, DiscordPresenceContext | M1, M2 | PLANNED |
| M4 | Custom Hooks Automated Tests | Unit & integration tests for all 9 domain custom hooks | M1, M2 | PLANNED |
| M5 | Consuming Components Automated Tests | Component tests for Header, HomePage, AdminLoginPage, AdminLayout, AdminHeader | M1, M2, M3 | PLANNED |
| M6 | E2E Testing Track & Full Test Suite Integration | Opaque-box E2E test harness and test scenarios (Tiers 1-4), `TEST_READY.md`, 100% zero failure test pass | M1, M3, M4, M5 | PLANNED |
| M7 | Adversarial Hardening & Forensic Audit | Tier 5 adversarial stress testing, Forensic integrity audit verification | M6 | PLANNED |

## Interface Contracts
### Context Interfaces
- `AuthContextType`:
  ```ts
  interface AuthContextType {
    isAuthenticated: boolean;
    isSupabase: boolean;
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<SignInResult>;
    signOut: () => Promise<void>;
  }
  ```
- `GameContextType`:
  ```ts
  interface GameContextType {
    selectedGame: 'Heartopia' | 'Petit Planet' | 'Loftia';
    setSelectedGame: (game: 'Heartopia' | 'Petit Planet' | 'Loftia') => void;
  }
  ```
- `DiscordPresenceContextType`:
  ```ts
  interface DiscordPresenceData {
    onlineCount: number | null;
    serverName: string;
  }
  ```

### Custom Test Scripts Interface (R2)
- `node ./scripts/test-runner.mjs [options]`:
  - Flags: `--contexts`, `--watch`, `--coverage`, `--filter <pattern>`, `--bail`
  - Exit code: `0` on success, `1` on failure
- `node ./scripts/test-contexts.mjs`:
  - Executes all context, hook, and consuming component tests
  - Emits formatted Context Verification Matrix to stdout
  - Exit code: `0` on 100% pass, `1` on failure
- `npm test`: alias to `node ./scripts/test-runner.mjs`
- `npm run test:contexts`: alias to `node ./scripts/test-contexts.mjs`

## Code Layout
- `src/context/`: Context provider definitions (`DiscordPresenceContext.tsx`)
- `src/hooks/`: Custom hooks and context hooks (`useAuth.tsx`, `useGame.tsx`, `useDiscordPresence.ts`, ...)
- `src/components/`: Consuming components (`common/Header.tsx`, `admin/*`, `home/*`)
- `src/pages/`: Page components (`HomePage.tsx`, `admin/*`, ...)
- `src/tests/`: Test harness, polyfills, mocks (`setup.ts`, `test-utils.tsx`, `mocks/*`)
- `src/__tests__/`: Automated test suite
  - `src/__tests__/contexts/`: Context & provider test specs
  - `src/__tests__/hooks/`: Custom hook test specs
  - `src/__tests__/components/`: Consuming component test specs
  - `src/__tests__/e2e/`: Workflow & integration test specs
- `scripts/`: Custom test execution scripts (`test-runner.mjs`, `test-contexts.mjs`)
- Write ownership: Workers are assigned strictly partitioned file paths; concurrent workers must not edit the same files.
