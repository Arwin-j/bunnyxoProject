# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest version of Bunny Hub on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Reporting a Vulnerability

The Bunny Hub team takes the security of our community and user data seriously. If you discover a security vulnerability or potential threat in this repository, please report it responsibly.

### How to Report

**Please do NOT disclose security vulnerabilities publicly via GitHub issues or public forums.**

Instead, please report security vulnerabilities using one of the following methods:

1. **GitHub Private Vulnerability Reporting:**
   * Navigate to the **Security** tab of this repository on GitHub.
   * Click **Report a vulnerability** to submit an advisory draft privately to maintainers.
2. **Direct Contact:**
   * Reach out to project maintainers directly via official social channels or community Discord.

### What to Include in Your Report

To help us investigate and resolve the issue quickly, please include:

* A clear summary of the vulnerability.
* Detailed steps to reproduce the issue (proof-of-concept code, HTTP requests, or browser steps).
* The potential impact on users, admins, or the platform.
* Any potential mitigations or fixes you have identified.

### Response Timeline

* **Acknowledgment:** We will acknowledge receipt of your vulnerability report within **48 hours**.
* **Assessment & Fix:** We will evaluate the report, verify the issue, and provide an estimated timeline for a patch.
* **Public Disclosure:** Once a fix has been tested and deployed to the `main` branch, we will credit the reporter (unless anonymity is requested) in the release notes.

---

## Security Best Practices for Contributors

* **Never commit secrets:** Do not commit API keys, private tokens, Supabase `service_role` keys, or sensitive credentials to Git.
* **Environment variables:** Use `.env.local` for local development configurations and ensure sensitive variables are ignored in `.gitignore`.
* **Client-side considerations:** Remember that client-side credentials or mock tokens are visible in browser code; enforce real access control and Row Level Security (RLS) policies on the Supabase database backend.

Thank you for helping keep Bunny Hub safe and secure for all bunnies! 🐰🌸
