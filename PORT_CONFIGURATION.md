# Port Configuration Guide

## 📍 Current Port Configuration

### Backend
- **Server Port**: `8000` (default)
- **Environment Variable**: `PORT` (optional, defaults to 8000)
- **File**: `backend/src/server.ts`

### Frontend  
- **Dev Server Port**: `5173` (Vite default)
- **Can be configured** via `vite.config.ts` or environment variable
- **Production**: Depends on deployment (Docker uses port 80)

### Socket.IO
- **Server URL**: `http://localhost:8000` (same as backend)
- **Client URL**: `http://localhost:8000` (configured in ChatContext.tsx)

## 🔍 Detailed Configuration

### 1. Backend Port (`backend/src/server.ts`)
```typescript
const PORT = process.env.PORT || 8000;
```
- ✅ Defaults to `8000`
- ✅ Can be overridden with `PORT` environment variable

### 2. Backend CORS (`backend/src/app.ts`)
```typescript
origin: 'http://localhost:5173'
```
- ✅ Configured for frontend on port `5173`

### 3. Socket.IO CORS (`backend/src/socket/socketHandler.ts`)
```typescript
origin: "http://localhost:5173"
```
- ✅ Configured for frontend on port `5173`

### 4. Frontend API URL (`frontend/src/utils/urls.ts`)
```typescript
export const BASE_URL: string = 'http://localhost:8000/api';
```
- ✅ Points to backend on port `8000`

### 5. Frontend Socket.IO Client (`frontend/src/context/ChatContext.tsx`)
```typescript
const socket = io("http://localhost:8000", {...});
```
- ✅ Points to backend on port `8000`

### 6. Frontend Dev Port (`frontend/vite.config.ts`)
- ⚠️ **Not explicitly set** - uses Vite default (`5173`)
- **Recommendation**: Explicitly configure for clarity

## ✅ Port Configuration Summary

| Component | Port | Configurable | Status |
|-----------|------|--------------|--------|
| Backend API | 8000 | Yes (PORT env) | ✅ |
| Frontend Dev | 5173 | Yes (vite.config) | ⚠️ Should be explicit |
| Socket.IO | 8000 | Same as backend | ✅ |
| CORS Backend | 5173 | Hardcoded | ✅ |
| CORS Socket.IO | 5173 | Hardcoded | ✅ |
| BASE_URL | 8000 | Hardcoded | ✅ |

## 🔧 Recommendations

### 1. Make Frontend Port Explicit
Add to `frontend/vite.config.ts`:
```typescript
server: {
  port: 5173
}
```

### 2. Create Environment Variables (Optional)
For easier configuration, you could use environment variables:

**Backend `.env`:**
```env
PORT=8000
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
VITE_PORT=5173
```

## 🚀 Current Status

✅ **All ports are correctly configured and consistent!**

- Backend: `8000` ✅
- Frontend: `5173` ✅  
- CORS: Properly configured ✅
- Socket.IO: Properly configured ✅
- API URLs: Correct ✅

## 🔄 Changing Ports

If you need to change ports:

1. **Change Backend Port:**
   - Set `PORT` environment variable in backend
   - Update `frontend/src/utils/urls.ts` BASE_URL
   - Update `frontend/src/context/ChatContext.tsx` Socket.IO URL

2. **Change Frontend Port:**
   - Update `frontend/vite.config.ts` server.port
   - Update `backend/src/app.ts` CORS origin
   - Update `backend/src/socket/socketHandler.ts` CORS origin

## 📝 Quick Reference

**Default Setup:**
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- API Base: `http://localhost:8000/api`
- Socket.IO: `http://localhost:8000`

Everything is properly configured! 🎉
