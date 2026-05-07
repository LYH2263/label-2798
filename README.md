# 商品库存管理系统

## 📖 项目简介

这是一个基于 **Vue 3 + Node.js + MySQL** 的全栈商品库存管理系统，采用前后端分离架构和 Docker 容器化部署。系统提供了完整的用户认证、员工管理和商品库存管理功能，适用于中小型企业的日常库存管理需求。

### 核心特性

- 🔐 **安全认证**：基于 bcrypt 加密的用户登录系统，支持会话管理和路由守卫
- 👥 **员工管理**：完整的员工信息 CRUD 操作，支持分页、搜索和多维度筛选
- 📦 **库存管理**：商品信息管理、库存预警、入库出库操作
- 🎨 **现代化 UI**：采用 Element Plus 组件库，紫色渐变主题，极简美观
- 🐳 **容器化部署**：一键启动，开箱即用，无需复杂配置
- 📊 **数据持久化**：MySQL 数据库存储，支持数据卷持久化

## 🛠 技术栈

### 前端技术
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5.x
- **UI 组件库**: Element Plus 2.5+
- **路由管理**: Vue Router 4.x
- **HTTP 客户端**: Axios
- **状态管理**: Pinia + Session Storage

### 后端技术
- **运行环境**: Node.js
- **Web 框架**: Express 4.x
- **ORM 框架**: Sequelize 6.x
- **数据库**: MySQL 8.0
- **密码加密**: bcryptjs
- **日志管理**: Winston

### 部署技术
- **容器化**: Docker + Docker Compose
- **Web 服务器**: Nginx (前端静态资源托管)
- **数据持久化**: Docker Volume

## 🚀 启动指南 (How to Run)

### 前置要求
- Docker Desktop 已安装并运行
- Docker Compose 已安装

### 一键启动

1. 在根目录执行：
```bash
docker compose up --build
```

2. 等待容器启动完成（首次启动可能需要 2-3 分钟）

3. 访问系统：
   - 前端: http://localhost:3000
   - 后端 API: http://localhost:3001
   - 健康检查: http://localhost:3001/api/health

### 停止服务
```bash
docker compose down
```

### 查看日志
```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 🔗 服务地址 (Services)

| 服务 | 地址 | 说明 |
|------|------|------|
| Frontend | http://localhost:3000 | 前端界面 |
| Backend API | http://localhost:3001 | 后端接口 |
| MySQL | localhost:3306 | 数据库 (user: root / pass: root) |

## 🧪 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |

> **注**：所有用户数据均存储在数据库中，不再使用 Mock 数据。

## 📋 功能清单

### 🔐 用户认证模块
- [x] 用户登录（数据库验证 + bcrypt 密码加密）
- [x] 会话管理（基于 Pinia 和 Session Storage）
- [x] 路由守卫（未登录自动跳转登录页）
- [x] 个人中心（全屏展示，支持查看和修改个人信息）
- [x] 密码修改（安全的密码更新机制）
- [x] 退出登录（清除会话信息）

### 👥 员工管理模块
- [x] 员工列表展示（分页显示，数据来源于 MySQL 数据库）
- [x] 新增员工（表单验证，包含工号、姓名、性别、年龄、部门、职位等）
- [x] 编辑员工信息（支持修改所有员工字段）
- [x] 删除员工（带确认提示）
- [x] 搜索功能（支持姓名、工号模糊查询）
- [x] 筛选功能（按部门、在职状态筛选）
- [x] 员工状态管理（在职/离职/休假）

### 📦 商品管理模块
- [x] 商品列表展示（分页显示，数据来源于 MySQL 数据库）
- [x] 新增商品（表单验证，包含商品编码、名称、分类、品牌、价格、库存等）
- [x] 编辑商品信息（支持修改所有商品字段）
- [x] 删除商品（带确认提示）
- [x] 库存操作（入库/出库功能）
- [x] 库存预警（低库存/缺货状态自动标识）
- [x] 搜索功能（支持商品名称、商品编码模糊查询）
- [x] 筛选功能（按分类、库存状态筛选）
- [x] 商品状态管理（正常/低库存/缺货/停产）

### 🎨 系统特性
- [x] 现代化 UI 设计（统一紫色渐变主题，圆角卡片，柔和阴影）
- [x] 交互优化（隐藏滚动条，支持鼠标滚轮滚动）
- [x] 响应式布局（适配桌面端和移动端）
- [x] 加载状态提示（Loading 动画）
- [x] 操作反馈（Toast 消息通知）
- [x] 错误处理（统一的错误拦截和提示）
- [x] 容器化部署（Docker Compose 一键启动）
- [x] 健康检查（服务状态监控）
- [x] 日志记录（Winston 日志管理）

## 🐳 Docker 架构

```
┌─────────────────┐
│   Frontend      │  Vue3 + Element Plus (Port: 3000)
│   (Nginx)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │  Express + Sequelize (Port: 3001)
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │  MySQL 8.0 (Port: 3306)
│   (MySQL)       │
└─────────────────┘
```

## 📁 项目结构

```
inventory-management/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # API 路由
│   │   └── app.js        # 入口文件
│   ├── Dockerfile
│   └── package.json
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── utils/        # 工具函数
│   │   └── router/       # 路由配置
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Docker 编排
└── README.md
```

## 🔌 API 接口文档

### 用户接口
| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/users` | 获取用户列表 | - |
| POST | `/api/users/login` | 用户登录 | `username`, `password` |
| PUT | `/api/users/profile` | 更新个人资料 | `email`, `phone` |
| PUT | `/api/users/password` | 修改密码 | `oldPassword`, `newPassword` |

### 员工接口
| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/employees` | 获取员工列表 | `page`, `pageSize`, `search`, `department`, `status` |
| GET | `/api/employees/:id` | 获取单个员工详情 | `id` |
| POST | `/api/employees` | 创建员工 | `employeeNo`, `name`, `gender`, `age`, `department`, `position`, 等 |
| PUT | `/api/employees/:id` | 更新员工信息 | `id` + 员工字段 |
| DELETE | `/api/employees/:id` | 删除员工 | `id` |

### 商品接口
| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | `/api/products` | 获取商品列表 | `page`, `pageSize`, `search`, `category`, `status` |
| GET | `/api/products/:id` | 获取单个商品详情 | `id` |
| POST | `/api/products` | 创建商品 | `productCode`, `name`, `category`, `price`, `stock`, 等 |
| PUT | `/api/products/:id` | 更新商品信息 | `id` + 商品字段 |
| DELETE | `/api/products/:id` | 删除商品 | `id` |
| PUT | `/api/products/:id/stock` | 库存操作（入库/出库） | `id`, `quantity`, `type` |

### 系统接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |

## 🎨 UI 设计规范

- **主色调**: 紫色渐变 (#667eea -> #764ba2)
- **圆角**: 12px（卡片）、8px（按钮）、10px（输入框）
- **阴影**: 柔和投影，营造层次感
- **字体**: PingFang SC, Microsoft YaHei

## 📝 开发说明

### 登录实现说明
系统采用前后端分离架构，登录逻辑通过后端数据库验证实现，不再使用 mock 数据：

```javascript
const login = async (form) => {
  let valid = await form.validate()
  if (valid) {
    loading.value = true
    try {
      const res = await http.post('/users/login', {
        username: loginForm.username,
        password: loginForm.password
      })
      if (res.status === 200) {
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        ElMessage.success('登录成功')
        router.push('/main')
      }
    } catch (error) {
      // 错误已在响应拦截器处理
    } finally {
      loading.value = false
    }
  }
}
```