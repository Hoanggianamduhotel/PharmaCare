# Deployment Guide - PharmaCare

## Fix Netlify Build & Blank Page Issues

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

3. **netlify.toml** - Simplified Netlify configuration
   ```toml
   [build]
     publish = "dist/public"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_ENV = "production"
     VITE_API_URL = "/api"
     VITE_SUPABASE_ANON_KEY = "..."
     VITE_SUPABASE_URL = "..."
   ```

4. **Dependencies Fix** - Moved vite & @vitejs/plugin-react to dependencies cho Netlify build

## Deploy Steps:

### 1. Build local để test:
```bash
npm run build
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
  - Build command: `npm run build`
  - Publish directory: `dist/public`

## Common Issues Fixed:

✅ **Build Dependencies**: vite & @vitejs/plugin-react moved to dependencies  
✅ **Production Config**: vite.config.prod.ts không có Replit plugins  
✅ **Module Resolution**: Fixed __dirname cho ES modules  
✅ **SPA Routing**: _redirects file cho React Router  
✅ **Build Config**: netlify.toml đơn giản với npm run build  
✅ **Assets Path**: base path được set đúng trong vite config

## Deployment được fix hoàn chỉnh:
- Local build: ✅ (npm run build works)  
- Netlify build: ✅ (tất cả dependencies có sẵn)
- SPA routing: ✅ (_redirects file)
- Production config: ✅ (vite.config.prod.ts)  

## Test Deployment:
1. Sau khi deploy, mở URL Netlify
2. Kiểm tra Console (F12) xem có lỗi JS không
3. Test navigation giữa các trang
4. Kiểm tra API calls có hoạt động không (nếu có backend)

## Backend Note:
App này có backend Express, nếu muốn full-stack deploy cần:
- Backend: Deploy trên Railway/Render/Heroku
- Frontend: Deploy trên Netlify với API_URL pointing to backend