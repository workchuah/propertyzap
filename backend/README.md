# Backend (Placeholder)

This folder is reserved for future backend services (APIs, database integrations, background jobs, etc.) for **PropertyZap**.

At the moment, the application is fully static:

- All pages and logic live in the `../frontend` directory (HTML, CSS, JavaScript).
- Sample datasets (`*.csv`) are also served statically from `frontend/`.
- Client-side JavaScript reads these CSV files via `fetch()` from the browser.

## When you are ready to add a real backend

You can use this folder to add:

- A Node.js/Express server (e.g. `server.js` and a `package.json`).
- API routes for:
  - Loading and saving user profiles (buyers/sellers).
  - Managing property listings in a real database (PostgreSQL, MySQL, MongoDB, Supabase, etc.).
  - Serving CSV/JSON data via HTTP instead of from static files.

For now, no backend code is required to deploy the front-end to Netlify; simply configure Netlify to use the `frontend` directory as the publish directory.


