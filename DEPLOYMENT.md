# Deployment Guide - PharmaCare

## Fix Netlify Blank Page Issues

### Files đã được tạo/sửa để fix trang trắng:

1. **client/public/_redirects** - SPA routing redirect
   ```
   /*    /index.html   200
   ```

2. **netlify.toml** - Netlify configuration
   ```toml
   [build]
     publish = "dist/public"
     command = "vite build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_ENV = "production"
     VITE_API_URL = "/api"
   ```

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
- Drag & drop thư mục `dist/public` vào Netlify
- Hoặc connect GitHub repo với build command: `vite build`

## Common Issues Fixed:

✅ **SPA Routing**: _redirects file cho React Router  
✅ **Build Config**: netlify.toml với đúng publish directory  
✅ **Assets Path**: base path được set đúng trong vite config  
✅ **Environment**: Production build không có dev dependencies  

## Test Deployment:
1. Sau khi deploy, mở URL Netlify
2. Kiểm tra Console (F12) xem có lỗi JS không
3. Test navigation giữa các trang
4. Kiểm tra API calls có hoạt động không (nếu có backend)

## Backend Note:
App này có backend Express, nếu muốn full-stack deploy cần:
- Backend: Deploy trên Railway/Render/Heroku
- Frontend: Deploy trên Netlify với API_URL pointing to backend