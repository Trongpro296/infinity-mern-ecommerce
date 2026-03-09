# ♾️ INFINITY E-COMMERCE

**Nền tảng thương mại điện tử fullstack xây dựng trên MERN Stack**
---

## 📋 Mục lục

- [Giới thiệu dự án](#-giới-thiệu-dự-án)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [Hướng dẫn sử dụng](#-hướng-dẫn-sử-dụng)
- [Tài liệu API](#-tài-liệu-api)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Ảnh chụp màn hình](#-ảnh-chụp-màn-hình)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

## 📖 Giới thiệu dự án

**Infinity** là ứng dụng thương mại điện tử hiện đại, đầy đủ tính năng, được xây dựng trên nền tảng **MERN** (MongoDB, Express, React, Node.js). Dự án sử dụng kiến trúc **Monorepo** gồm ba ứng dụng độc lập:

| Ứng dụng | Mô tả | Cổng mặc định |
|---|---|---|
| `frontend/` | Giao diện mua sắm dành cho khách hàng | `:5173` |
| `admin/` | Bảng điều khiển quản trị | `:5174` |
| `backend/` | Máy chủ API RESTful | `:4000` |

## ✨ Tính năng

### 🛒 Giao diện khách hàng
- Đăng ký & đăng nhập tài khoản với xác thực **JWT**
- Duyệt sản phẩm theo **danh mục** và **phân loại**
- Tìm kiếm và lọc sản phẩm theo thời gian thực
- Quản lý giỏ hàng (thêm / cập nhật / xoá)
- Quy trình đặt hàng (checkout) hoàn chỉnh
- Theo dõi lịch sử đơn hàng cá nhân
- Thiết kế responsive, tương thích mọi thiết bị

### 🔧 Bảng quản trị (Admin)
- Xác thực quản trị viên riêng biệt
- **Quản lý sản phẩm** — Thêm, sửa, xoá sản phẩm kèm upload nhiều ảnh
- **Quản lý danh mục** — Tạo và tổ chức danh mục sản phẩm
- **Quản lý đơn hàng** — Xem tất cả đơn và cập nhật trạng thái giao hàng
- Bảng thống kê tổng quan

### ⚡ Backend API
- API RESTful với Express 5
- Xác thực JWT & phân quyền theo vai trò (User / Admin)
- Upload ảnh lên **Cloudinary** thông qua Multer
- Cơ sở dữ liệu MongoDB với Mongoose ODM
- Xác thực đầu vào & xử lý lỗi

## 🛠 Công nghệ sử dụng

### Frontend & Admin

| Công nghệ | Vai trò |
|---|---|
| **React 19** | Thư viện giao diện người dùng |
| **Vite 7** | Công cụ build & máy chủ phát triển |
| **React Router v7** | Định tuyến phía client |
| **Tailwind CSS 3** | Framework CSS tiện ích |
| **Axios** | Thư viện gọi HTTP |
| **React Toastify** | Thông báo dạng toast |
| **React Icons** | Thư viện biểu tượng |

### Backend

| Công nghệ | Vai trò |
|---|---|
| **Node.js** | Môi trường chạy |
| **Express 5** | Framework web |
| **MongoDB + Mongoose** | Cơ sở dữ liệu & ODM |
| **JWT** | Xác thực dựa trên token |
| **Bcrypt** | Băm mật khẩu |
| **Cloudinary** | Lưu trữ ảnh đám mây |
| **Multer** | Middleware xử lý upload file |
| **CORS** | Chia sẻ tài nguyên giữa các nguồn gốc khác nhau |

## 🏗 Kiến trúc hệ thống

```
┌──────────────┐     ┌──────────────┐
│   Frontend   │     │    Admin     │
│  React + Vite│     │  React + Vite│
│   :5173      │     │   :5174      │
└──────┬───────┘     └──────┬───────┘
       │    HTTP (Axios)    │
       └────────┬───────────┘
                ▼
       ┌────────────────┐
       │   Backend API  │
       │  Express :4000 │
       ├────────────────┤
       │  Middleware     │
       │  ├─ Auth (JWT)  │
       │  ├─ AdminAuth   │
       │  └─ Multer      │
       ├────────────────┤
       │  Controllers   │
       │  ├─ User        │
       │  ├─ Product     │
       │  ├─ Category    │
       │  ├─ Cart        │
       │  └─ Order       │
       └────────┬───────┘
                │
       ┌────────┴───────┐
       │                │
  ┌────▼─────┐   ┌──────▼─────┐
  │ MongoDB  │   │ Cloudinary │
  │ Cơ sở   │   │ Lưu trữ   │
  │ dữ liệu │   │ hình ảnh   │
  └──────────┘   └────────────┘
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- **Node.js** ≥ 18.x — [Tải về](https://nodejs.org/)
- **MongoDB** — [Atlas (Đám mây)](https://www.mongodb.com/atlas) hoặc cài cục bộ
- **Cloudinary** — [Đăng ký miễn phí](https://cloudinary.com/)
- **Git** — [Tải về](https://git-scm.com/)

### Các bước cài đặt

**1. Clone dự án về máy**

```bash
git clone https://github.com/Trongpro296/infinity-mern-ecommerce.git
cd infinity-mern-ecommerce
```

**2. Cài đặt thư viện cho từng ứng dụng**

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install
```

**3. Cấu hình biến môi trường** *(xem phần [Biến môi trường](#-biến-môi-trường))*

**4. Khởi chạy máy chủ phát triển**

Mở **3 Terminal riêng biệt** và chạy lần lượt:

```bash
# Terminal 1 — Backend
cd backend
npm run server          # Dùng nodemon, tự động reload khi thay đổi code

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — Admin
cd admin
npm run dev
```

## 🔐 Biến môi trường

Tạo file `.env` bên trong thư mục `backend/`:

```env
# Máy chủ
PORT=4000

# Cơ sở dữ liệu
MONGODB_URI=mongodb+srv://<tên_user>:<mật_khẩu>@cluster.mongodb.net/<tên_db>

# Xác thực
JWT_SECRET=khoá_bí_mật_của_bạn

# Cloudinary
CLOUDINARY_CLOUD_NAME=tên_cloud_của_bạn
CLOUDINARY_API_KEY=api_key_của_bạn
CLOUDINARY_API_SECRET=api_secret_của_bạn

# Tài khoản Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=mật_khẩu_admin
```

> ⚠️ **Tuyệt đối không** đẩy file `.env` lên GitHub. File này đã được thêm sẵn trong `.gitignore`.

## 💻 Hướng dẫn sử dụng

Sau khi khởi chạy thành công cả 3 máy chủ:

| Ứng dụng | Đường dẫn | Đăng nhập |
|---|---|---|
| **Frontend** | `http://localhost:5173` | Đăng ký tài khoản mới |
| **Admin** | `http://localhost:5174` | Dùng `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `.env` |
| **API** | `http://localhost:4000` | Trả về `"API WORKING"` |

## 🔌 Tài liệu API

Đường dẫn gốc: `http://localhost:4000`

### Xác thực người dùng (Authentication)

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/user/register` | — | Đăng ký tài khoản mới |
| `POST` | `/api/user/login` | — | Đăng nhập & nhận JWT token |
| `POST` | `/api/user/admin` | — | Đăng nhập quyền Admin |

### Sản phẩm (Products)

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/product/list` | — | Lấy danh sách tất cả sản phẩm |
| `POST` | `/api/product/single` | — | Xem chi tiết một sản phẩm |
| `POST` | `/api/product/add` | 🔒 Admin | Thêm sản phẩm mới (multipart/form-data) |
| `POST` | `/api/product/remove` | 🔒 Admin | Xoá sản phẩm |

### Danh mục (Categories)

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/category/list` | — | Lấy danh sách tất cả danh mục |
| `POST` | `/api/category/add` | 🔒 Admin | Thêm danh mục mới |
| `POST` | `/api/category/remove` | 🔒 Admin | Xoá danh mục |

### Giỏ hàng (Cart)

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/cart/add` | 🔒 User | Thêm sản phẩm vào giỏ hàng |
| `POST` | `/api/cart/update` | 🔒 User | Cập nhật số lượng sản phẩm |
| `POST` | `/api/cart/get` | 🔒 User | Lấy giỏ hàng của người dùng |

### Đơn hàng (Orders)

| Phương thức | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/order/place` | 🔒 User | Đặt đơn hàng mới |
| `POST` | `/api/order/userorders` | 🔒 User | Xem lịch sử đơn hàng cá nhân |
| `POST` | `/api/order/list` | 🔒 Admin | Xem tất cả đơn hàng |
| `POST` | `/api/order/status` | 🔒 Admin | Cập nhật trạng thái đơn hàng |

> 🔒 **Yêu cầu xác thực**: Gửi kèm `token` trong header của request.

## 📂 Cấu trúc thư mục

```
infinity-mern-ecommerce/
│
├── frontend/                    # Giao diện khách hàng
│   └── src/
│       ├── components/          # Các component tái sử dụng
│       │   ├── Navbar.jsx       #   Thanh điều hướng
│       │   ├── Hero.jsx         #   Banner chính
│       │   ├── ProductItem.jsx  #   Thẻ sản phẩm
│       │   ├── CartTotal.jsx    #   Tổng giỏ hàng
│       │   ├── SearchBar.jsx    #   Thanh tìm kiếm
│       │   ├── BestSeller.jsx   #   Sản phẩm bán chạy
│       │   ├── Footer.jsx       #   Chân trang
│       │   └── ...
│       ├── pages/               # Các trang
│       │   ├── Home.jsx         #   Trang chủ
│       │   ├── Collection.jsx   #   Danh sách sản phẩm
│       │   ├── Product.jsx      #   Chi tiết sản phẩm
│       │   ├── Cart.jsx         #   Giỏ hàng
│       │   ├── PlaceOrder.jsx   #   Đặt hàng / Checkout
│       │   ├── Orders.jsx       #   Lịch sử đơn hàng
│       │   ├── Login.jsx        #   Đăng nhập / Đăng ký
│       │   └── ...
│       ├── context/             # React Context (state toàn cục)
│       └── utils/               # Hàm tiện ích
│
├── admin/                       # Bảng quản trị
│   └── src/
│       ├── components/          # Component Admin
│       │   ├── Navbar.jsx       #   Thanh điều hướng admin
│       │   ├── SideBar.jsx      #   Thanh bên điều hướng
│       │   └── Login.jsx        #   Đăng nhập admin
│       └── pages/
│           ├── Add.jsx          #   Thêm sản phẩm mới
│           ├── List.jsx         #   Quản lý danh sách sản phẩm
│           └── Order.jsx        #   Quản lý đơn hàng
│
├── backend/                     # Máy chủ API RESTful
│   ├── server.js                # Điểm khởi chạy
│   ├── config/
│   │   ├── mongodb.js           #   Kết nối cơ sở dữ liệu
│   │   └── cloudinary.js        #   Cấu hình lưu trữ đám mây
│   ├── models/
│   │   ├── userModel.js         #   Schema người dùng
│   │   ├── productModel.js      #   Schema sản phẩm
│   │   ├── categoryModel.js     #   Schema danh mục
│   │   └── orderModel.js        #   Schema đơn hàng
│   ├── controllers/
│   │   ├── userController.js    #   Logic xác thực & người dùng
│   │   ├── productController.js #   CRUD sản phẩm
│   │   ├── categoryController.js#   CRUD danh mục
│   │   ├── cartController.js    #   Xử lý giỏ hàng
│   │   └── orderController.js   #   Xử lý đơn hàng
│   ├── middleware/
│   │   ├── auth.js              #   Xác thực JWT người dùng
│   │   ├── adminAuth.js         #   Xác thực JWT quản trị viên
│   │   └── multer.js            #   Cấu hình upload file
│   └── routes/
│       ├── userRoutes.js
│       ├── productRoute.js
│       ├── categoryRoute.js
│       ├── cartRoute.js
│       └── orderRoute.js
│
├── .gitignore
└── README.md
```

## 📸 Ảnh chụp màn hình

> 🖼️ *Sẽ được cập nhật sau — Thêm ảnh chụp màn hình ứng dụng tại đây.*

<!--
Thêm ảnh theo cú pháp:
![Trang chủ](./screenshots/home.png)
![Chi tiết sản phẩm](./screenshots/product.png)
![Bảng quản trị](./screenshots/admin.png)
-->

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh và đánh giá cao!

1. **Fork** dự án
2. **Tạo** nhánh tính năng mới
   ```bash
   git checkout -b feature/tinh-nang-moi
   ```
3. **Commit** thay đổi
   ```bash
   git commit -m "feat: thêm tính năng mới"
   ```
4. **Push** lên nhánh
   ```bash
   git push origin feature/tinh-nang-moi
   ```
5. **Mở** Pull Request

> 💡 Vui lòng cập nhật bài kiểm thử (test) tương ứng nếu cần thiết.

## 📄 Giấy phép

Dự án được phân phối theo giấy phép **MIT**. Xem [`LICENSE`](LICENSE) để biết thêm chi tiết.

## 📬 Liên hệ

**Trongpro296** — [GitHub Profile](https://github.com/Trongpro296)

Link dự án: [https://github.com/Trongpro296/infinity-mern-ecommerce](https://github.com/Trongpro296/infinity-mern-ecommerce)

---

<div align="center">

**⭐ Nếu dự án hữu ích với bạn, hãy cho một ngôi sao nhé! ⭐**

</div>
