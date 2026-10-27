# Contributing to Bunny Hub 🐰🌸

First off, thank you for taking the time to contribute! Bunny Hub is a cozy, sticker-book aesthetic companion site for the *Heartopia* and cozy games community. We welcome contributions from developers, designers, and community members of all experience levels.

Please take a moment to review this document before submitting your contributions.

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree to uphold its standards of kindness, empathy, and mutual respect.

---

## 🛠️ Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [npm](https://www.npmjs.com/) or your preferred package manager

### Local Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bunnyxoProject.git
   cd bunnyxoProject
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

4. **Verify type checking and production build:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```

---

## 🎨 Design & Coding Guidelines

Bunny Hub has a distinct **cozy retro-sticker aesthetic**. When contributing UI components or pages, please keep the following guidelines in mind:

* **Sticker Book Theme:**
  * Thick ink outlines (`border-[2.5px]` or `border-[3px]` with `#4a2835`).
  * Hard offset ink shadows (`shadow-ink`, `shadow-berry`, or `3px 3px 0 0 #4a2835`).
  * Rounded pill shapes, smooth curves, and tactile button press animations (`active:translate-y-0.5 active:shadow-none`).
  * Cozy pastel color palette (warm berry pinks, buttery yellows, mints, and soft creams).
* **Desktop & Responsive Layouts:**
  * Ensure elements scale cleanly on desktop screens (prevent oversized images or stretched banners) while maintaining mobile responsiveness.
* **Component Architecture:**
  * Build reusable components in `src/components/common/` or `src/components/admin/`.
  * Abstract data fetching and persistence through repository services (`src/data/`).
  * Preserve TypeScript types and avoid `any`.

---

## 🚀 How to Submit Changes

1. **Create a branch for your feature or fix:**
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```

2. **Make your changes:**
   * Keep your commits focused and descriptive (e.g. `feat: add filter for fishing spot pins` or `fix: resolve mobile navbar overflow`).

3. **Verify locally:**
   * Ensure TypeScript passes (`npx tsc --noEmit`).
   * Ensure the build completes cleanly (`npm run build`).

4. **Push your branch and open a Pull Request:**
   * Push your branch to your fork:
     ```bash
     git push origin feat/your-feature-name
     ```
   * Open a Pull Request against the `main` branch.
   * Provide a clear description of the change and include before/after screenshots for any visual UI modifications.

---

## 🐛 Reporting Bugs & Feature Ideas

* **Bug Reports:** Open an issue describing what happened, steps to reproduce, and your browser/operating system.
* **Feature Requests:** Have a cozy idea for the island map, codes tracker, or event countdowns? Feel free to open an issue or join the discussion!

Thank you for helping make Bunny Hub a cozier place for everyone! 🐰✨
