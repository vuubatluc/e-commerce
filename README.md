# 🛒 E-Commerce Web Application

Ứng dụng thương mại điện tử được xây dựng với React và Spring Boot, hỗ trợ xác thực JWT và quản lý người dùng dựa trên vai trò.

## 🚀 Tính năng

### Xác thực & Phân quyền
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với JWT token
- ✅ Phân quyền theo vai trò (Admin/User)
- ✅ Tự động chuyển hướng dựa trên role
- ✅ Quản lý hồ sơ cá nhân (xem/sửa thông tin)

### Dashboard Admin
- ✅ Giao diện dashboard riêng với navbar chuyên dụng
- ✅ Thống kê tổng quan (người dùng, sản phẩm, đơn hàng, doanh thu)
- ✅ Quản lý người dùng (xem/sửa/xóa)
- ✅ Bảo vệ tài khoản Admin khỏi bị chỉnh sửa/xóa
- ✅ Menu điều hướng: Tổng quan, Người dùng, Sản phẩm, Đơn hàng

### Giao diện người dùng
- ✅ Navbar thông minh (tự động thay đổi theo role)
- ✅ Dropdown menu với tùy chọn hồ sơ và đăng xuất
- ✅ Thiết kế responsive trên mọi thiết bị
- ✅ Theme trắng/xám hiện đại

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 19.2.0** - Thư viện UI
- **React Router DOM 7.x** - Điều hướng SPA
- **CSS3** - Styling với responsive design

### Backend
- **Spring Boot** - REST API
- **JWT** - Token-based authentication
- **MySQL** - Cơ sở dữ liệu

## 📦 Cài đặt

### Yêu cầu
- Node.js 16+ và npm
- Spring Boot backend đang chạy tại `http://localhost:8080/api`

### Các bước cài đặt

1. **Clone repository**
```bash
git clone https://github.com/vuubatluc/e-commerce.git
cd e-commerce
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Chạy ứng dụng**
```bash
npm start
```

Ứng dụng sẽ chạy tại [http://localhost:3000](http://localhost:3000)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/introspect` - Kiểm tra token

### Users
- `POST /api/users` - Tạo người dùng mới
- `GET /api/users/myinfo` - Lấy thông tin người dùng hiện tại
- `PUT /api/users/updatemyinfo` - Cập nhật thông tin cá nhân

### Admin - User Management
- `GET /api/users` - Lấy danh sách tất cả người dùng
- `GET /api/users/{id}` - Lấy thông tin chi tiết người dùng
- `PUT /api/users/{id}` - Cập nhật thông tin người dùng
- `DELETE /api/users/{id}` - Xóa người dùng

## 📂 Cấu trúc thư mục

```
src/
├── components/
│   ├── Dashboard.js          # Trang dashboard admin
│   ├── DashboardNavbar.js    # Navbar cho dashboard
│   ├── Login.js              # Trang đăng nhập
│   ├── Signup.js             # Trang đăng ký
│   ├── Navbar.js             # Navbar chính
│   ├── Profile.js            # Trang hồ sơ cá nhân
│   ├── UserManagement.js     # Quản lý người dùng (Admin)
│   └── styles/               # CSS files
│       ├── Auth.css
│       ├── Dashboard.css
│       ├── Profile.css
│       └── UserManagement.css
├── services/
│   └── api.js                # Service layer cho API calls
├── styles/
│   ├── Navbar.css
│   └── DashboardNavbar.css
├── App.js                    # Main component & routing
├── App.css                   # Global styles
└── index.js                  # Entry point
```

## 🎨 Màu sắc

- **Primary (Dashboard)**: `#2c3e50` - Xanh đậm
- **Background**: `#f5f5f5` - Xám nhạt
- **Text**: `#333` - Đen
- **White**: `#ffffff` - Trắng
- **Accent**: `#3498db` - Xanh dương

## 👤 Tài khoản mẫu

### Admin
- Username: `admin`
- Role: `ADMIN`

### User
- Username: `user`
- Role: `USER`

> Lưu ý: Tạo tài khoản thông qua trang Đăng ký hoặc liên hệ admin

## 🔐 Bảo mật

- JWT token được lưu trong `localStorage`
- Token tự động gửi kèm trong header `Authorization: Bearer {token}`
- Admin accounts được bảo vệ khỏi thao tác xóa/sửa
- Route protection dựa trên role

## 📱 Responsive Design

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (<768px)

## 🚧 Tính năng sắp tới

- [ ] Quản lý sản phẩm
- [ ] Quản lý đơn hàng
- [ ] Giỏ hàng
- [ ] Thanh toán
- [ ] Báo cáo và thống kê chi tiết
- [ ] Upload ảnh đại diện
- [ ] Email verification
- [ ] Password recovery

## 📄 License

MIT License - Copyright (c) 2025

## 👨‍💻 Tác giả

**Vuu Bat Luc**
- GitHub: [@vuubatluc](https://github.com/vuubatluc)

---

Made with ❤️ using React & Spring Boot


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
