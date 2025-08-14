# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.


## Laravel Token Injection Authentication

This app can be embedded inside a Laravel app without showing a login form. The Laravel app should open the root route of this SPA and pass the access token (and optional session ID) via query params. The root route will store the values, validate the token by calling the API, and then redirect.

- Primary injection route: `/`
- Supported query params:
  - `token` or `access_token`: The Bearer token to store under `auth_token`.
  - `session_id` or `sid` (optional): A numeric/string session identifier stored under `session_id`.

Example:

```
/?token=YOUR_TOKEN&session_id=1
```

Behavior on `/`:
- The app stores the token as `auth_token` and session id as `session_id` in `localStorage`.
- It immediately validates by calling a lightweight API endpoint. If the token works:
  - Redirects to `/pos` automatically.
- If validation fails or no token is available:
  - Clears any stored auth and redirects to a 404 error page.
- The Axios instance in `services/api.ts` automatically adds on all requests:
  - `Authorization: Bearer <auth_token>` header.
  - `session_id` as a query parameter for GET or in the request body for POST.

Optional legacy route:
- You can still use `/auth/inject?token=...&session_id=...&redirect=/pos` which stores and then redirects, but `/` is now the recommended entry point.

Notes:
- Make sure your Laravel app generates and passes a valid API token.
- To clear the session manually, remove `auth_token` and `session_id` from localStorage or implement a small logout utility.
