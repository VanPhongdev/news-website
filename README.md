# Website TinTức24h - Hệ thống Quản lý Tin tức

Website tin tức/báo chí với hệ thống phân quyền 4 vai trò (Admin, Editor, Author, Reader), được xây dựng với Node.js + Express + MongoDB cho backend và React cho frontend.

##  Tính năng

### Người dùng
- **Reader**: Đọc bài viết, bình luận, like
- **Author**: Viết bài, quản lý bài viết của mình
- **Editor**: Duyệt bài, quản lý chuyên mục
- **Admin**: Toàn quyền quản trị hệ thống

### Chức năng chính
- Quản lý bài viết (CRUD, draft, pending, published)
- Hệ thống bình luận nested (không giới hạn độ sâu)
- Like/Unlike bài viết và bình luận
- Yêu cầu xóa bài viết đã đăng
- Tìm kiếm theo bài báo

##  Yêu cầu hệ thống

- **Node.js**: v14.0.0 trở lên
- **MongoDB**: v4.0 trở lên
- **npm** hoặc **yarn**

##  Hướng dẫn cài đặt

### 1. Cài đặt các công cụ cần thiết

#### Node.js
- Tải và cài đặt từ: https://nodejs.org/
- Kiểm tra: `node --version` và `npm --version`

#### MongoDB
- Tải và cài đặt từ: https://www.mongodb.com/try/download/community
- Khởi động MongoDB

### 2. Clone project

```bash
git clone <repository-url>
cd news-website
```

### 3. Sau khi clone

# Backend
```bash
cd backend
npm install
```

# Frontend  
```bash
cd ../frontend
npm install
```

### 4. Cấu hình môi trường

#### Tạo file `.env` từ template:

```bash
cd backend
cp .env.example .env
```

#### Chỉnh sửa file `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-uri-here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=1d
```

**Lưu ý:** Hãy thay đổi `JWT_SECRET` và `MONGODB_URI` cho phù hợp với môi trường

### 5. Tạo tài khoản Admin

```bash
cd backend
npm run create-admin
```

**Tài khoản mặc định:**
- Username: `admin`
- Email: `admin@tintuc24h.com`
- Password: `123456`

### 6. Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend chạy tại: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend chạy tại: http://localhost:3000

## 📁 Cấu trúc thư mục

```
news-website/
├── backend/
│   ├── config/          # Cấu hình database, etc.
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, role middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # Context API (Auth)
    │   ├── pages/       # Page components
    │   └── services/    # API services
    └── index.html
```
