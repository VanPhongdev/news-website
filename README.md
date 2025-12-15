# Website Tin Tức - TinTức24h

Website tin tức/báo chí với hệ thống phân quyền 4 vai trò (Admin, Editor, Author, Reader), được xây dựng với Node.js + Express + MongoDB cho backend và React cho frontend.

# Tổng quan dự án
Hệ thống quản lý tin tức với workflow hoàn chỉnh:
- **Admin**: Quản lý users, xóa categories/articles, duyệt yêu cầu xóa bài
- **Editor**: Duyệt bài, đăng bài, tạo categories
- **Author**: Viết bài, gửi duyệt, yêu cầu xóa bài đã đăng
- **Reader**: Đọc bài viết đã publish

# Sau khi clone về

**1. Cài đặt dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

**2. Cấu hình môi trường:**
```bash
# Tạo file .env trong thư mục backend
cd backend
cp .env.example .env
```

Chỉnh sửa `backend/.env`:
```env
PORT=5000
MONGODB_URI=your-mongodb-uri-here
JWT_SECRET=your-secret-key-here
```

**3. Tạo tài khoản Admin:**
```bash
# Trong thư mục backend
npm run create-admin
```
Tài khoản mặc định: `admin` / `123456`

**4. Chạy ứng dụng:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**5. Truy cập:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

# Tính năng chính

# Hệ thống phân quyền 4 vai trò

# **Admin** - Quản trị viên
- ✅ Quản lý users (xem danh sách, xóa, thay đổi role)
- ✅ Quản lý categories (xem danh sách, xóa)
- ✅ Quản lý articles (xem tất cả bài viết, xóa)
- ✅ Duyệt/từ chối yêu cầu xóa bài từ Author
- ✅ Xem thống kê tổng quan (số users, categories, articles)

# **Editor** - Biên tập viên
- ✅ Duyệt bài viết (approve/reject)
- ✅ Đăng bài đã duyệt (publish)
- ✅ Quản lý categories (tạo mới, xem danh sách)
- ✅ Xem tất cả bài viết trong hệ thống
- ✅ Duyệt/từ chối yêu cầu xóa bài từ Author

# **Author** - Tác giả
- ✅ Viết bài mới (draft)
- ✅ Chỉnh sửa bài của mình
- ✅ Gửi bài để duyệt (submit for review)
- ✅ Gửi lại bài bị từ chối
- ✅ Yêu cầu xóa bài đã đăng (với lý do)
- ✅ Gửi lại yêu cầu xóa nếu bị từ chối
- ✅ Xem trạng thái bài viết của mình

# **Reader** - Độc giả
- ✅ Đọc bài viết đã được publish
- ✅ Xem chi tiết bài viết
- ✅ Lọc bài viết theo chuyên mục
- ✅ Tìm kiếm bài viết

###  Workflow quản lý bài viết

```
[Author viết bài] → draft
       ↓
[Author gửi duyệt] → pending
       ↓
[Editor/Admin xét duyệt]
       ↓
   ┌───┴───┐
   ↓       ↓
approved  rejected
   ↓       ↓
[Đăng bài] [Author sửa & gửi lại]
   ↓
published
```

### 🗑️ Workflow yêu cầu xóa bài

```
[Author yêu cầu xóa bài đã đăng + lý do]
       ↓
   pending
       ↓
[Editor/Admin xét duyệt]
       ↓
   ┌───┴───┐
   ↓       ↓
approved  rejected
   ↓       ↓
[Xóa bài] [Author có thể gửi lại]
```

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication & authorization
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables management
- **slugify** - URL-friendly slug generation
- **nodemon** - Development auto-restart

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Quill** - Rich text editor
- **Context API** - State management
- **Material Symbols** - Icon library (Google Fonts)

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn
