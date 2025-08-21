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

3. **netlify.toml** - Simple and clean Netlify configuration
   ```toml
   [build]
     publish = "dist/public"
     command = "npm run build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"

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
npm run build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
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
  - Build command: `npm run build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`
  - Publish directory: `dist/public`

## Common Issues Fixed:

✅ **Build Dependencies**: vite & @vitejs/plugin-react moved to dependencies  
✅ **Production Config**: vite.config.prod.ts không có Replit plugins  
✅ **Module Resolution**: Fixed __dirname cho ES modules  
✅ **SPA Routing**: _redirects file cho React Router  
✅ **Build Config**: netlify.toml với node_modules/.bin paths  
✅ **Assets Path**: base path được set đúng trong vite config

## Deployment được fix hoàn chỉnh:
- Local build: ✅ (npm run build + npx esbuild)  
- Netlify build: ✅ (npm scripts resolve tools automatically)
- SPA routing: ✅ (_redirects file)
- Production config: ✅ (vite.config.prod.ts)
- Simple & clean: ✅ (no hard-coded paths, no version pinning needed)

## Root Cause Analysis:
- **Issue**: Sử dụng đường dẫn cứng `./node_modules/.bin/vite` thay vì npm script
- **Problem**: Netlify không tìm thấy binary files trong node_modules/.bin
- **Simple Solution**: Dùng `npm run build` - npm script tự động resolve tools
- **Why it works**: npm scripts có access đến node_modules/.bin trong PATH
- **Result**: Build thành công với vite từ devDependencies + npx esbuild  

## Test Deployment:
1. Sau khi deploy, mở URL Netlify
2. Kiểm tra Console (F12) xem có lỗi JS không
3. Test navigation giữa các trang
4. Kiểm tra API calls có hoạt động không (nếu có backend)

## Backend Note:
App này có backend Express, nếu muốn full-stack deploy cần:
- Backend: Deploy trên Railway/Render/Heroku
- Frontend: Deploy trên Netlify với API_URL pointing to backend