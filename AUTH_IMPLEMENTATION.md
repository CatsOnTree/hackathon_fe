# Frontend Login & Auth Integration - Implementation Guide

## What was implemented

### 1. **Auth Context** (`src/contexts/AuthContext.tsx`)
- Stores token and role in state and localStorage
- Provides `useAuth()` hook for components to access auth state
- Functions: `login()` (stores credentials), `logout()` (clears credentials and redirects)

### 2. **Login Page** (`src/pages/Login/LoginPage.tsx`)
- Beautiful login form at route `/login`
- Calls `POST /api/auth/login` with username/password
- On success: stores token + role, redirects to dashboard
- On error: shows toast notification
- Displays demo credentials for quick testing

### 3. **Protected Routes** 
- **AppRoutes.tsx updated**: checks `isAuthenticated` before showing main routes
- Unauthenticated users are redirected to `/login`
- **ProtectedRoute component** (optional, created but not actively used yet) for granular role-based route guards

### 4. **Axios Interceptor** (`src/services/axios.ts`)
- Request interceptor: automatically attaches `Authorization: Bearer <token>` header
- Response interceptor: detects 401 responses, clears auth, redirects to login
- All API calls now include the auth token automatically

### 5. **MainLayout Updates** (`src/layouts/MainLayout.tsx`)
- Displays current user's role in the top header
- Added logout button (red icon) in top-right
- Click logout → clears auth, redirects to login
- Role display: ADMIN → "Admin", PANELIST → "Panelist", PARTICIPANT → "Participant"

### 6. **App Root** (`src/App.tsx`)
- Wrapped with `<AuthProvider>` to provide auth context to entire app
- Token persists on page reload (stored in localStorage)

## How to test

### 1. Start the backend
```bash
cd backend
mvn spring-boot:run
```

### 2. Start the frontend
```bash
npm run dev
```

### 3. Navigate to http://localhost:3000
- You'll be redirected to `/login` (not authenticated yet)

### 4. Login with demo credentials:

**Admin:**
```
Username: admin
Password: adminpass
```

**Panelist:**
```
Username: panelist
Password: panelistpass
```

**Participant:**
```
Username: participant
Password: participantpass
```

### 5. After successful login:
- Token is stored in localStorage
- Redirected to dashboard (`/`)
- Header shows your role + logout button
- All API calls now include the auth token

### 6. Test token persistence:
- Reload the page (Ctrl+F5 or Cmd+Shift+R)
- You stay logged in (token restored from localStorage)

### 7. Logout:
- Click the red logout icon in top-right
- Redirected to login page
- localStorage is cleared

## Architecture

```
App
├── AuthProvider (stores token/role, provides useAuth hook)
│   └── BrowserRouter
│       └── AppRoutes
│           ├── /login → LoginPage (public, not in MainLayout)
│           └── /* → MainLayout (protected, only if authenticated)
│               ├── Dashboard
│               ├── Events
│               ├── ... all other pages
```

## Token flow

1. User logs in → LoginPage posts username/password to `/api/auth/login`
2. Backend returns `{ token, role }`
3. Frontend stores both in localStorage
4. AuthContext provides token + role to entire app
5. Axios interceptor automatically adds `Authorization: Bearer <token>` to all requests
6. If backend returns 401 → interceptor clears localStorage and redirects to login

## Next: Role-based UI

Frontend is ready for role-based UI hiding. Example:

```jsx
import { useAuth } from '../contexts/AuthContext';

export function AdminFeature() {
  const { role } = useAuth();
  
  if (role !== 'ADMIN') return null;
  return <button>Admin Only</button>;
}
```

## Backend integration points

The backend must:
1. ✅ POST `/api/auth/login` accepts `{ username, password }`, returns `{ token, role }`
2. ✅ JWT tokens expire (frontend detects 401 and redirects)
3. ✅ CORS allows origin `http://localhost:3000`
4. ✅ All protected endpoints require `Authorization: Bearer <token>` header

Currently implemented in the backend:
- Auth controller with login endpoint
- JWT util for token creation
- JwtFilter to extract token from header
- SecurityConfig with route-level access control
- CorsConfig allowing localhost:3000

## Common tasks

### Hide feature from certain roles:

```jsx
const { role } = useAuth();
if (!['ADMIN', 'PANELIST'].includes(role)) {
  return <p>You don't have access</p>;
}
```

### Call a protected API:

```jsx
import { api } from '../services/axios';

const response = await api.get('/api/events');
// Token is automatically included!
```

### Programmatic logout:

```jsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const { logout } = useAuth();
const navigate = useNavigate();

logout();
navigate('/login');
```

---
Generated: 2026-06-25
