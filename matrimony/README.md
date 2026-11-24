# Kerala Kalyans Matrimony frontend

See the [project README](../README.md) for local setup, membership limits, and profile API changes.

## API configuration

For a Vercel frontend and a separately hosted backend, set the Vercel project's
Production environment variable `VITE_API_BASE` to the backend's public HTTPS
base URL, including the `/api` suffix (for example, `https://api.example.com/api`).
Check that the backend responds at `/api/health`, then redeploy the frontend.
Vite reads the variable at build time.

Without that variable, production builds use
`https://kerala-kalyans-matrimony.onrender.com/api`. The local Vite dev server
defaults to `http://localhost:5000/api`.

## Admin fonts

Playfair Display loads from Google Fonts. To serve licensed Gotham webfonts on
the admin screens, set `VITE_ADMIN_GOTHAM_STYLESHEET` to the HTTPS URL of your
webfont CSS and redeploy. Define its font faces as `Admin Gotham` with Book
(400), Medium (500), and Bold (700). Without that stylesheet, the admin uses
locally installed Gotham when available, then DM Sans.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
