# GTM

React (Vite) frontend + Node.js/Express backend + MongoDB. Everything is organised **by feature**.

## Run it

```bash
npm run install:all          # installs root, client and server packages
cp server/.env.example server/.env   # then fill in MONGO_URI and JWT_SECRET
npm run dev                  # starts server (5000) and client (5173) together
```

## Frontend: `client/src`

```
constants/
  colour.js        <- ALL colours (edit here, whole site updates)
  typography.js    <- fonts, sizes, weights
  layout.js        <- radius, shadows, spacing, motion
  routes.js        <- route paths + user roles
  theme.js         <- turns the constants above into CSS variables
Shared_Components/ <- BrandMark, Button, SectionHeading, FormField, Reveal
Features/
  Home/       components/ Hooks/ Pages/ data/ Home.css
  Auth/       components/ Hooks/ Pages/ Services/ Auth.css
  Dashboard/  Pages/
```

Using colours: in CSS `color: var(--color-primary)`, in JS `import { COLORS } from "../constants/colour"`.
Variable name = key in kebab-case: `COLORS.primaryHover` -> `--color-primary-hover`.

## Backend: `server/src`

```
config/       env.js, db.js
middleware/   authMiddleware.js, errorMiddleware.js, validate.js
utils/        ApiError.js, response.js, generateToken.js
features/
  auth/   auth.routes.js, auth.controller.js, auth.service.js, auth.validation.js
  users/  user.model.js, user.routes.js, user.controller.js, user.service.js, user.validation.js
```

Add a new feature by creating `features/<name>/` with the same 4–5 files and one line in `app.js`.

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| POST | /api/auth/logout | public |
| GET | /api/auth/me | logged in |
| GET / PATCH | /api/users/me | logged in |
| GET | /api/users | admin only |

Admin sign-up needs `ADMIN_INVITE_CODE` from `server/.env`.
