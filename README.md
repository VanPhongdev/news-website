# 📰 Website Tin Tức - News Website

Website tin tức/báo chí hoàn chỉnh với hệ thống phân quyền 4 vai trò (Admin, Editor, Author, Reader), được xây dựng với Node.js + Express + MongoDB cho backend và React cho frontend.

## ✨ Tính năng chính

### 🔐 Hệ thống phân quyền 4 vai trò

#### **Admin** - Quản trị viên
- ✅ Quản lý users (xem danh sách, xóa, thay đổi role)
- ✅ Quản lý categories (xem danh sách, xóa)
- ✅ Quản lý articles (xem tất cả bài viết, xóa)
- ✅ Duyệt/từ chối yêu cầu xóa bài từ Author
- ✅ Xem thống kê tổng quan (số users, categories, articles)

#### **Editor** - Biên tập viên
- ✅ Duyệt bài viết (approve/reject)
- ✅ Đăng bài đã duyệt (publish)
- ✅ Quản lý categories (tạo mới, xem danh sách)
- ✅ Xem tất cả bài viết trong hệ thống
- ✅ Duyệt/từ chối yêu cầu xóa bài từ Author

#### **Author** - Tác giả
- ✅ Viết bài mới (draft)
- ✅ Chỉnh sửa bài của mình
- ✅ Gửi bài để duyệt (submit for review)
- ✅ Gửi lại bài bị từ chối
- ✅ Yêu cầu xóa bài đã đăng (với lý do)
- ✅ Gửi lại yêu cầu xóa nếu bị từ chối
- ✅ Xem trạng thái bài viết của mình

#### **Reader** - Độc giả
- ✅ Đọc bài viết đã được publish
- ✅ Xem chi tiết bài viết
- ✅ Lọc bài viết theo chuyên mục
- ✅ Tìm kiếm bài viết

### 📝 Workflow quản lý bài viết

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

### 🎨 Tính năng giao diện

- ✅ Responsive design
- ✅ Navigation bar với menu theo role
- ✅ Category navigation
- ✅ Dashboard riêng cho từng role
- ✅ Modal UI cho các thao tác quan trọng
- ✅ Status badges với màu sắc phân biệt
- ✅ Real-time statistics
- ✅ Dropdown select cho role management (thay vì prompt)

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool & dev server
- **Context API** - State management

## 📋 Yêu cầu hệ thống

- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd news-website
```

### Bước 2: Cài đặt MongoDB

#### Windows:
1. Tải MongoDB Community Server từ [trang chủ MongoDB](https://www.mongodb.com/try/download/community)
2. Cài đặt MongoDB (chọn "Complete" installation)
3. Khởi động MongoDB:
   ```bash
   # Mở Command Prompt với quyền Administrator
   net start MongoDB
   ```
4. Kiểm tra MongoDB đang chạy:
   ```bash
   mongosh
   # Hoặc
   mongo
   ```

#### macOS (sử dụng Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
# Import public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Tạo list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Cài đặt
sudo apt-get update
sudo apt-get install -y mongodb-org

# Khởi động
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Kiểm tra MongoDB đã cài đặt thành công:**
```bash
mongosh --version
# Hoặc
mongo --version
```

### Bước 3: Cài đặt Backend

```bash
cd backend
npm install
```

**Tạo file `.env` từ template:**

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Chỉnh sửa file `.env`:**

```env
PORT=5000
MONGODB_URI=your_mongo_url_here
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=1d
NODE_ENV=development
```

### 3. Tạo tài khoản Admin đầu tiên

```bash
# Đảm bảo đang ở thư mục backend
npm run create-admin
```

Script này sẽ tạo tài khoản admin với thông tin từ `.env` hoặc mặc định:
- **Username**: admin
- **Email**: admin@example.com
- **Password**: 123456

⚠️ **Lưu ý**: Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

### 4. Cài đặt Frontend

```bash
# Mở terminal mới hoặc quay lại thư mục gốc
cd ../frontend
npm install
```

**Kiểm tra cấu hình API:**

File `frontend/vite.config.js` đã được cấu hình proxy:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### Bước 6: Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

✅ **Kết quả mong đợi:**
```
Server is running on port 5000
✅ MongoDB Connected Successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

✅ **Kết quả mong đợi:**
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Bước 7: Truy cập ứng dụng

1. Mở browser và truy cập: `http://localhost:3000`
2. Đăng nhập với tài khoản admin:
   - Username: `admin`
   - Password: `123456`
3. Thay đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

### Bước 8: Tạo dữ liệu mẫu (Tùy chọn)

**Tạo Categories:**
1. Đăng nhập với tài khoản admin
2. Tạo một tài khoản Editor (Admin Dashboard → Users → Đổi role)
3. Đăng nhập với tài khoản Editor
4. Vào Editor Dashboard → Quản lý Chuyên mục → Tạo categories:
   - Thể thao
   - Công nghệ
   - Giải trí
   - Kinh tế
   - Chính trị

**Tạo tài khoản Author và viết bài:**
1. Đăng ký tài khoản mới với role "Author"
2. Đăng nhập và vào Author Dashboard
3. Viết bài mới, chọn category
4. Gửi bài để duyệt
5. Đăng nhập lại với Editor để duyệt và đăng bài

## 🔧 Cấu hình nâng cao

### Thay đổi Port

**Backend** (file `backend/.env`):
```env
PORT=5000  # Đổi thành port khác nếu cần
```

**Frontend** (file `frontend/vite.config.js`):
```javascript
server: {
  port: 3000,  // Đổi thành port khác nếu cần
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // Cập nhật theo backend port
      changeOrigin: true
    }
  }
}
```

### Sử dụng MongoDB Atlas (Cloud)

1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster miễn phí
3. Lấy connection string
4. Cập nhật `MONGODB_URI` trong `.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/news-website?retryWrites=true&w=majority
   ```

### Chạy Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Authentication

#### Đăng ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "reader"  // reader, author (admin/editor phải tạo thủ công)
}
```

#### Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Users (Admin only)

```http
GET    /api/users              # Lấy danh sách users
GET    /api/users/:id          # Lấy thông tin user
PUT    /api/users/:id          # Cập nhật user
DELETE /api/users/:id          # Xóa user
PUT    /api/users/:id/role     # Thay đổi role
```

### Categories

```http
GET    /api/categories         # Lấy danh sách categories (public)
GET    /api/categories/:id     # Lấy category theo ID (public)
POST   /api/categories         # Tạo category (admin, editor)
PUT    /api/categories/:id     # Cập nhật category (admin, editor)
DELETE /api/categories/:id     # Xóa category (admin)
```

### Articles

```http
GET    /api/articles                   # Lấy danh sách articles
GET    /api/articles/:id               # Lấy article theo ID
POST   /api/articles                   # Tạo article (author+)
PUT    /api/articles/:id               # Cập nhật article
DELETE /api/articles/:id               # Xóa article
PUT    /api/articles/:id/submit        # Gửi bài để duyệt (author)
PUT    /api/articles/:id/status        # Thay đổi status (editor, admin)
PUT    /api/articles/:id/publish       # Publish article (editor, admin)
```

### Deletion Requests (NEW!)

```http
POST   /api/deletion-requests          # Tạo yêu cầu xóa bài (author+)
GET    /api/deletion-requests          # Lấy tất cả yêu cầu (admin, editor)
GET    /api/deletion-requests/my-requests  # Lấy yêu cầu của mình (author)
PATCH  /api/deletion-requests/:id/approve  # Duyệt & xóa bài (admin, editor)
PATCH  /api/deletion-requests/:id/reject   # Từ chối yêu cầu (admin, editor)
```

## 🎯 Hướng dẫn sử dụng

### Dành cho Author

1. **Đăng ký tài khoản**
   - Truy cập `/register`
   - Chọn role "Author"
   - Điền thông tin và đăng ký

2. **Viết bài mới**
   - Đăng nhập và vào Author Dashboard
   - Click "Viết bài mới"
   - Nhập tiêu đề, nội dung, chọn chuyên mục
   - Lưu bài (status: draft)

3. **Gửi bài để duyệt**
   - Trong danh sách bài draft, click "📤 Gửi duyệt"
   - Bài chuyển sang status "pending"
   - Chờ Editor/Admin duyệt

4. **Xử lý bài bị từ chối**
   - Nếu bài bị reject, click "✏️ Chỉnh sửa lại"
   - Sửa nội dung
   - Click "📤 Gửi lại để duyệt"

5. **Yêu cầu xóa bài đã đăng**
   - Tìm bài đã publish
   - Click "🗑️ Yêu cầu xóa"
   - Nhập lý do (tối thiểu 10 ký tự)
   - Gửi yêu cầu
   - Nếu bị từ chối, có thể click "🔄 Gửi lại yêu cầu"

### Dành cho Editor

1. **Đăng nhập**
   - Tài khoản Editor phải được Admin tạo
   - Truy cập `/editor` sau khi đăng nhập

2. **Duyệt bài**
   - Tab "Bài chờ duyệt"
   - Xem nội dung bài viết
   - Click "✓ Duyệt bài" hoặc "✗ Từ chối"

3. **Đăng bài**
   - Tab "Bài đã duyệt"
   - Click "📰 Đăng bài"
   - Bài chuyển sang status "published"

4. **Quản lý chuyên mục**
   - Tab "Quản lý Chuyên mục"
   - Click "+ Tạo chuyên mục mới"
   - Nhập tên và mô tả

5. **Xử lý yêu cầu xóa bài**
   - Tab "Yêu cầu xóa bài"
   - Xem lý do của Author
   - Click "✓ Duyệt" (xóa bài vĩnh viễn) hoặc "✗ Từ chối"

### Dành cho Admin

1. **Đăng nhập**
   - Sử dụng tài khoản admin đã tạo
   - Truy cập `/admin`

2. **Quản lý Users**
   - Tab "Người dùng"
   - Xem danh sách users với filter theo role
   - Click "Đổi vai trò" để thay đổi role (dropdown select: reader, author, editor, admin)
   - Click "Xóa" để xóa user (có xác nhận)

3. **Quản lý Categories**
   - Tab "Chuyên mục"
   - Xem danh sách categories
   - Click "Xóa" để xóa category (có xác nhận)
   - ⚠️ **Lưu ý**: Admin không thể tạo/sửa category, chỉ có thể xóa

4. **Quản lý Articles**
   - Tab "Bài viết"
   - Xem tất cả bài viết (mọi status)
   - Click "Xóa" để xóa bài viết (có xác nhận)
   - ⚠️ **Lưu ý**: Admin không thể duyệt/đăng bài trực tiếp từ dashboard

5. **Xử lý yêu cầu xóa bài**
   - Tab "Yêu cầu xóa bài"
   - Xem tất cả yêu cầu từ Author
   - Lọc theo trạng thái (Tất cả/Chờ duyệt/Đã duyệt/Đã từ chối)
   - Click "✓ Duyệt" để xóa bài vĩnh viễn (có xác nhận)
   - Click "✗ Từ chối" để giữ bài và từ chối yêu cầu

### Dành cho Reader

1. **Xem bài viết**
   - Truy cập trang chủ
   - Xem danh sách bài đã đăng
   - Click vào bài để đọc chi tiết

2. **Lọc theo chuyên mục**
   - Click vào chuyên mục trên navigation bar
   - Xem các bài thuộc chuyên mục đó

## 📁 Cấu trúc thư mục

```
news-website/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   ├── article.controller.js
│   │   └── deletionRequest.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Article.js
│   │   └── DeletionRequest.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── article.routes.js
│   │   └── deletionRequest.routes.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CategoryNav.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx
    │   │   ├── editor/
    │   │   │   └── EditorDashboard.jsx
    │   │   ├── author/
    │   │   │   └── AuthorDashboard.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── ArticleDetail.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 🔐 Bảo mật

- ✅ Mật khẩu được mã hóa bằng bcryptjs (10 salt rounds)
- ✅ Authentication sử dụng JWT tokens
- ✅ Protected routes với middleware kiểm tra token
- ✅ Role-based access control (RBAC) cho tất cả endpoints
- ✅ Input validation với express-validator
- ✅ CORS configuration
- ✅ Secure HTTP headers

## 🎨 Status Badges

Hệ thống sử dụng các status badges với màu sắc để dễ phân biệt:

- **draft** (xám) - Bài nháp
- **pending** (vàng) - Chờ duyệt
- **approved** (xanh lá) - Đã duyệt
- **rejected** (đỏ) - Bị từ chối
- **published** (xanh dương) - Đã đăng

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Giải pháp**: 
- Đảm bảo MongoDB đang chạy
- Kiểm tra MONGODB_URI trong `.env`
- Thử kết nối: `mongosh` hoặc `mongo`

### Lỗi CORS
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Giải pháp**: 
- Backend đã cấu hình CORS cho `http://localhost:3000`
- Đảm bảo frontend đang chạy đúng port

### Lỗi 401 Unauthorized
**Giải pháp**: 
- Token có thể đã hết hạn (mặc định 7 ngày)
- Đăng nhập lại để lấy token mới
- Kiểm tra JWT_SECRET trong `.env`

### Lỗi "authorize is not a function"
**Giải pháp**: 
- Đã được fix trong `auth.middleware.js`
- Restart backend server

### Không tạo được admin
**Giải pháp**:
- Chạy `npm run create-admin` trong thư mục backend
- Kiểm tra MongoDB đang chạy
- Xem log để biết lỗi cụ thể

## 📊 Database Schema

### User
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: reader, author, editor, admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String (unique, required),
  slug: String (auto-generated),
  description: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Article
```javascript
{
  title: String (required),
  slug: String (auto-generated),
  content: String (required),
  excerpt: String,
  thumbnail: String,
  author: ObjectId (ref: User),
  category: ObjectId (ref: Category),
  status: String (enum: draft, pending, approved, rejected, published),
  views: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### DeletionRequest
```javascript
{
  article: ObjectId (ref: Article),
  author: ObjectId (ref: User),
  reason: String (required, 10-500 chars),
  status: String (enum: pending, approved, rejected),
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Tính năng nổi bật

### 1. Dropdown Role Management
- Thay vì dùng `prompt()`, Admin thay đổi role qua dropdown select
- UI/UX tốt hơn, tránh lỗi nhập sai

### 2. Article Deletion Request System
- Author có thể yêu cầu xóa bài đã đăng
- Phải cung cấp lý do (10-500 ký tự)
- Editor/Admin xem xét và duyệt/từ chối
- Có thể gửi lại nếu bị từ chối
- Audit trail đầy đủ (ai duyệt, khi nào)

### 3. Resubmit Rejected Articles
- Author có thể gửi lại bài bị từ chối
- Không cần tạo bài mới
- Giữ nguyên lịch sử bài viết

### 4. Smart Status Display
- Badge màu sắc phân biệt rõ ràng
- Icon trực quan
- Thông tin đầy đủ (views, dates, reviewer)

## 📝 Scripts hữu ích

```bash
# Backend
npm run dev          # Chạy dev server với nodemon
npm start            # Chạy production server
npm run create-admin # Tạo tài khoản admin

# Frontend
npm run dev          # Chạy dev server với Vite
npm run build        # Build production
npm run preview      # Preview production build
```

## 🔄 Workflow Development

1. **Tạo feature mới**
   - Backend: Model → Controller → Routes → Middleware
   - Frontend: Component → API Service → Integration

2. **Testing**
   - Test API với Postman/Thunder Client
   - Test UI trên browser
   - Test permissions cho từng role

3. **Deployment**
   - Build frontend: `npm run build`
   - Deploy backend lên server (Heroku, Railway, etc.)
   - Deploy frontend lên Vercel/Netlify
   - Cấu hình environment variables

## 📝 License

MIT

## 👥 Contributors

Được phát triển bởi Antigravity AI Assistant

---

## 🎯 Roadmap

### Tính năng có thể mở rộng:
- [ ] Comments system
- [ ] Like/Bookmark articles
- [ ] Rich text editor (TinyMCE, Quill)
- [ ] Image upload to cloud (Cloudinary, AWS S3)
- [ ] Email notifications
- [ ] Search với full-text search
- [ ] Tags system
- [ ] Article versioning
- [ ] Analytics dashboard
- [ ] SEO optimization
- [ ] Multi-language support
- [ ] Dark mode

---

**⚠️ Lưu ý Production:**

Trước khi deploy production, cần:
- ✅ Đổi JWT_SECRET thành chuỗi random mạnh
- ✅ Đổi mật khẩu admin mặc định
- ✅ Bật HTTPS
- ✅ Thêm rate limiting
- ✅ Input sanitization
- ✅ File upload validation
- ✅ Logging và monitoring
- ✅ Backup database định kỳ
- ✅ Environment-specific configs
- ✅ Error handling toàn diện
