# Deployment Guide - PharmaCare

## Netlify Static Hosting (chỉ frontend)

**Lưu ý quan trọng:** Netlify chỉ host static files, không chạy Node.js server. Chỉ build frontend React app.

### Files đã được tạo/sửa để fix deployment:

1. **vite.config.prod.ts** - Production-only Vite config (không có Replit plugins)
   ```typescript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import path from "path";
   import { fileURLToPath } from 'url';

   const __dirname = path.dirname(fileURLToPath(import.meta.url));

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "client", "src"),
         "@shared": path.resolve(__dirname, "shared"),
         "@assets": path.resolve(__dirname, "attached_assets"),
       },
     },
     root: path.resolve(__dirname, "client"),
     build: {
       outDir: path.resolve(__dirname, "dist/public"),
       emptyOutDir: true,
       base: "./",
     },
   });
   ```

2. **client/public/_redirects** - SPA routing redirect
   ```
   /*    /index.html   200
   ```

3. **netlify.toml** - Netlify static hosting configuration  
   ```toml
   [build]
     publish = "dist/public"
     command = "vite build --config vite.config.prod.ts"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_ENV = "production"
     VITE_SUPABASE_URL = "..."
     VITE_SUPABASE_ANON_KEY = "..."
   ```

4. **Dependencies Fix** - Moved vite, esbuild, @vitejs/plugin-react to dependencies

## Deploy Steps:

### 1. Build local để test:
```bash
vite build --config vite.config.prod.ts
```

### 2. Check build output:
```bash
ls -la dist/public/
# Phải thấy: index.html, assets/, _redirects
```

### 3. Deploy trên Netlify:
- Connect GitHub repo 
- Build settings sẽ auto đọc từ netlify.toml
- Hoặc manual config:
  - Build command: `vite build --config vite.config.prod.ts`
  - Publish directory: `dist/public`

## Netlify Deployment Strategy:

**Static Frontend Only** - Netlify không host Node.js server
- ✅ Build chỉ frontend React app (vite build)
- ✅ Dependencies: vite & @vitejs/plugin-react trong dependencies  
- ✅ Production config: vite.config.prod.ts không có Replit plugins
- ✅ SPA routing: _redirects file cho React Router

## Backend Hosting Alternatives:
- **Replit:** Full-stack development và hosting
- **Render/Railway:** Node.js server hosting 
- **Vercel:** Serverless functions + frontend

## Đã fix hoàn chỉnh cho Netlify:
- Static build: ✅ (chỉ vite build)  
- Dependencies: ✅ (vite trong dependencies)
- SPA routing: ✅ (_redirects file)
- No server build: ✅ (bỏ esbuild khỏi Netlify)  

## Test Deployment:
1. Sau khi deploy, mở URL Netlify
2. Kiểm tra Console (F12) xem có lỗi JS không
3. Test navigation giữa các trang
4. Kiểm tra API calls có hoạt động không (nếu có backend)

## Backend Note:
App này có backend Express, nếu muốn full-stack deploy cần:
- Backend: Deploy trên Railway/Render/Heroku
- Frontend: Deploy trên Netlify với API_URL pointing to backend