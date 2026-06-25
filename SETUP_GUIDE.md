# Frontend & Backend Integration - Complete Setup Guide

## ✅ What's been completed

### Frontend Auth System (React)
1. **Login Page** at `/login` with demo credentials
2. **Auth Context** for managing token/role globally
3. **Protected Routes** - redirects unauthenticated users to login
4. **Axios Interceptor** - automatically attaches JWT token to all requests
5. **Logout button** in MainLayout header
6. **Persistent session** - token saved to localStorage

### Backend Auth System (Spring Boot)
1. **JWT Login endpoint** - `POST /api/auth/login`
2. **Role-based access control** - ADMIN, PANELIST, PARTICIPANT
3. **Security config** - validates routes by role
4. **CORS enabled** - allows `http://localhost:3000`
5. **Seeded demo users** - auto-created on first run

---

## 🚀 Running the full stack

### Terminal 1: Backend
```bash
cd backend
mvn spring-boot:run
```
Backend starts on: **http://localhost:8080**

### Terminal 2: Frontend  
```bash
cd <workspace>
npm run dev
```
Frontend starts on: **http://localhost:5173**

---

## 🔐 Testing the login flow

### Step 1: Navigate to frontend
Open **http://localhost:5173** in your browser.

### Step 2: You'll see the login page
- Shows 3 demo credential options
- Clean, professional UI

### Step 3: Login as Admin
```
Username: admin
Password: adminpass
```

### Step 4: After successful login
- ✅ Redirected to dashboard
- ✅ Header shows "Admin" role
- ✅ Logout button visible in top-right
- ✅ Token stored in localStorage

### Step 5: Test protected routes
- Navigate between pages → all include auth token
- Refresh page → stays logged in
- Click logout → redirected to login
- Try accessing `/` without token → redirected to login

---

## 📱 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | adminpass |
| Panelist | panelist | panelistpass |
| Participant | participant | participantpass |

---

## 🔌 API Integration Points

### Login Request
```javascript
POST http://localhost:8080/api/auth/login
{
  "username": "admin",
  "password": "adminpass"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "role": "ADMIN"
}
```

### Subsequent Requests
```javascript
// Token automatically added by axios interceptor
GET http://localhost:8080/api/events
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

## 📋 Files Modified/Created

### Frontend
- ✅ `src/contexts/AuthContext.tsx` - Auth state management
- ✅ `src/pages/Login/LoginPage.tsx` - Login page UI
- ✅ `src/components/common/ProtectedRoute.tsx` - Route guard component
- ✅ `src/services/axios.ts` - Updated with auth interceptor
- ✅ `src/routes/AppRoutes.tsx` - Updated with protected routes
- ✅ `src/layouts/MainLayout.tsx` - Added logout + role display
- ✅ `src/App.tsx` - Added AuthProvider wrapper

### Backend
- ✅ `backend/pom.xml` - Dependencies + Spring Security + JWT
- ✅ `backend/src/main/java/...` - Auth controller, JWT utils, security config
- ✅ `backend/src/main/resources/application.properties` - DB + JWT config

---

## 🔄 How it works

```
1. User visits http://localhost:5173
   ↓
2. App checks if token in localStorage
   ↓
3. No token? → Redirect to /login
   ↓
4. User submits login form with credentials
   ↓
5. Frontend calls POST /api/auth/login (backend)
   ↓
6. Backend validates, returns { token, role }
   ↓
7. Frontend stores token in localStorage + state
   ↓
8. Redirects to dashboard
   ↓
9. All subsequent API calls auto-include: Authorization: Bearer <token>
   ↓
10. If 401 response → logout + redirect to login
```

---

## 🛡️ Security checklist

- ✅ JWT tokens stored securely (localStorage for dev; use secure storage in prod)
- ✅ Tokens auto-included in all API requests
- ✅ Routes protected - unauthenticated users cannot access pages
- ✅ 401 handling - expired tokens trigger automatic logout
- ✅ CORS configured - allows frontend origin
- ✅ Demo credentials for testing (use strong passwords in production!)

---

## 📝 Next Steps for Backend

To fully match the frontend's expectations, implement these endpoints:

1. **`GET /api/events`** - List all events (ADMIN/PANELIST)
2. **`POST /api/events`** - Create event (ADMIN/PANELIST)
3. **`GET /api/participants`** - List participants (any authenticated)
4. **`POST /api/participants/register`** - Register participant (public or with specific role)
5. **`POST /api/attendance/check-in`** - Check-in participant
6. **`GET /api/dashboard/summary`** - Dashboard stats

Reference: See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for full endpoint specs.

---

## 🐛 Troubleshooting

### "Redirects to login immediately after login"
- Check backend is running on 8080
- Check `app.jwt.secret` matches between front and backend (currently hardcoded)
- Check network tab for 401 responses

### "Token not included in API calls"
- Open DevTools → Network tab
- Check Authorization header is present: `Bearer <token>`
- If missing, check `src/services/axios.ts` has token in localStorage

### "CORS error: Access-Control-Allow-Origin"
- Verify backend is allowing `http://localhost:3000`
- Check `backend/src/main/java/.../config/CorsConfig.java`
- Restart backend if CORS config changes

### "Logout button doesn't work"
- Check browser DevTools console for errors
- Ensure localStorage is writable

---

## 📚 Documentation Files

- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - Frontend auth details
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - API endpoints & integration guide  
- [PROJECT_DOCUMENTATION_BACKENED.md](PROJECT_DOCUMENTATION_BACKENED.md) - Backend API spec

---

Generated: 2026-06-25
Ready for development! 🎉
