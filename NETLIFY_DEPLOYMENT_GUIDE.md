# Hướng dẫn triển khai Netlify cho Pharmacy Management System

## Cấu trúc đã được chuyển đổi

✅ **Express routes → Netlify Functions**
- `/api/medicines` → `netlify/functions/medicines.ts`
- `/api/thuoc` → `netlify/functions/thuoc.ts`
- `/api/statistics` → `netlify/functions/statistics.ts`
- `/api/prescriptions` → `netlify/functions/prescriptions.ts`
- `/api/patients` → `netlify/functions/patients.ts`

✅ **Serverless Database**
- Sử dụng Supabase với `@supabase/supabase-js`
- Loại bỏ các dependencies stateful như `express-session`, `passport`
- Mỗi function tạo connection riêng đến Supabase

✅ **CORS Support**
- Tất cả functions đã có CORS headers
- Support OPTIONS preflight requests
- Cho phép cross-origin requests từ frontend

## Các bước deploy

### 1. Chuẩn bị environment variables
Trong Netlify dashboard, thêm environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Build settings trong Netlify
```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

### 3. Kiểm tra netlify.toml
File đã được cấu hình để:
- Route API calls đến functions
- SPA fallback cho client-side routing
- Correct build settings

## API Endpoints sẵn có

### Medicines API
- `GET /api/medicines` - Lấy tất cả thuốc
- `GET /api/medicines/search?q=query` - Tìm kiếm thuốc
- `GET /api/medicines/:id` - Lấy thuốc theo ID
- `POST /api/medicines` - Tạo thuốc mới
- `PATCH /api/medicines/:id` - Cập nhật thuốc
- `DELETE /api/medicines/:id` - Xóa thuốc

### Vietnamese Thuoc API
- `GET /api/thuoc` - Lấy tất cả thuốc (format Vietnamese)
- `GET /api/thuoc/search?q=query` - Tìm kiếm thuốc
- `GET /api/thuoc/:id` - Lấy thuốc theo ID
- `PATCH /api/thuoc/:id/stock` - Cập nhật tồn kho

### Other APIs
- `GET /api/statistics` - Thống kê tổng quan
- `GET /api/prescriptions` - Danh sách toa thuốc (placeholder)
- `GET /api/patients` - Danh sách bệnh nhân (placeholder)

## Đã giải quyết

✅ **Stateless Functions**: Mỗi function độc lập, không cần session state
✅ **Database Connection**: Sử dụng Supabase serverless driver
✅ **Type Safety**: Validation với Zod schemas
✅ **Error Handling**: Centralized error responses
✅ **CORS**: Proper cross-origin support

## Test local
Application vẫn chạy được local với Express server:
```bash
npm run dev
```

Và build production:
```bash
npm run build
```

Netlify sẽ tự động detect và deploy functions từ `netlify/functions/` folder.