# AuthFlow Pro

AuthFlow Pro is a full-stack authentication app. The React frontend talks only to the local Express API, and the Express API proxies authentication requests to FreeAPI.

## Project Structure

```text
AuthFlow/
  client/   React + Vite + Tailwind CSS
  server/   Node.js + Express proxy API
```

## Setup

```bash
npm install
npm run install:all
npm run dev
```

The apps run at:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Environment

Copy the examples if you want to customize ports or origins:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The default Vite setup proxies `/api` to the Express server, so the browser can keep auth cookies during local development.

## API Flow

- `POST /api/register` -> `POST https://api.freeapi.app/api/v1/users/register`
- `POST /api/login` -> `POST https://api.freeapi.app/api/v1/users/login`
- `POST /api/logout` -> `POST https://api.freeapi.app/api/v1/users/logout`
- `GET /api/me` -> `GET https://api.freeapi.app/api/v1/users/current-user`

The server rewrites upstream auth cookies so they can be stored by the local browser origin, then forwards those cookies back to FreeAPI on protected requests.
