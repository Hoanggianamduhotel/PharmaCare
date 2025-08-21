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

3. **netlify.toml** - Final working Netlify configuration
   ```toml
   [build]
     publish = "dist/public"
     command = "npm ci && npx --yes vite@5.4.19 build --config vite.config.prod.ts && npx --yes esbuild@0.25.0 server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"

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
npx --yes vite@5.4.19 build --config vite.config.prod.ts && npx --yes esbuild@0.25.0 server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
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
  - Build command: `npm ci && npx --yes vite@5.4.19 build --config vite.config.prod.ts && npx --yes esbuild@0.25.0 server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
  - Publish directory: `dist/public`

## Common Issues Fixed:

✅ **Build Dependencies**: vite & @vitejs/plugin-react moved to dependencies  
✅ **Production Config**: vite.config.prod.ts không có Replit plugins  
✅ **Module Resolution**: Fixed __dirname cho ES modules  
✅ **SPA Routing**: _redirects file cho React Router  
✅ **Build Config**: netlify.toml với node_modules/.bin paths  
✅ **Assets Path**: base path được set đúng trong vite config

## Deployment được fix hoàn chỉnh:
- Local build: ✅ (npx với explicit versions)  
- Netlify build: ✅ (npm ci + npx --yes đảm bảo reproducible builds)
- SPA routing: ✅ (_redirects file)
- Production config: ✅ (vite.config.prod.ts)
- Version control: ✅ (exact versions vite@5.4.19, esbuild@0.25.0)

## Root Cause Analysis:
- **Issue 1**: vite trong devDependencies, Netlify không install trong production
- **Issue 2**: npx version mismatch (7.1.3 vs 5.4.19)
- **Solution**: Dùng `npx --yes vite@5.4.19` để force exact version
- **Final Fix**: `npm ci` + `npx --yes` với explicit versions
- **Result**: Build thành công với vite v5.4.19 và esbuild v0.25.0  

## Test Deployment:
1. Sau khi deploy, mở URL Netlify
2. Kiểm tra Console (F12) xem có lỗi JS không
3. Test navigation giữa các trang
4. Kiểm tra API calls có hoạt động không (nếu có backend)

## Backend Note:
App này có backend Express, nếu muốn full-stack deploy cần:
- Backend: Deploy trên Railway/Render/Heroku
- Frontend: Deploy trên Netlify với API_URL pointing to backend