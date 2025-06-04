# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

# Strapi Backend

基于 Strapi CMS 构建的后端API服务。

## 功能特性

- 📝 文章管理系统
- 🏷️ 标签分类系统
- 🌐 多语言支持 (中文/英文)
- 🔄 AI翻译服务 (DeepL)
- 📱 RESTful API
- 🔐 JWT 认证

## 技术栈

- **框架**: Strapi v4
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **语言**: TypeScript
- **运行时**: Node.js 18+

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run develop

# 构建生产版本
npm run build
npm start
```

### Docker 部署

#### 1. 构建镜像
```powershell
# Windows PowerShell
.\docker-build.ps1
```

或者手动构建：
```bash
docker build -t strapi-backend .
```

#### 2. 启动服务
```powershell
# Windows PowerShell
.\docker-start.ps1
```

或者手动启动：
```bash
docker-compose up -d
```

#### 3. 访问应用
- **管理后台**: http://localhost:1337/admin
- **API接口**: http://localhost:1337/api

#### 4. 常用命令
```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 删除容器和镜像
docker-compose down --rmi all
```

## 环境配置

### 开发环境

创建 `.env` 文件：
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=1337

# 应用密钥 (请修改为随机字符串)
APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
API_TOKEN_SALT=your-api-token-salt
TRANSFER_TOKEN_SALT=your-transfer-token-salt

# 数据库配置
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# API配置
STRAPI_API_TOKEN=your-api-token
STRAPI_BASE_URL=http://localhost:1337

# DeepL翻译服务 (可选)
DEEPL_AUTH_KEY=your-deepl-api-key
```

### 生产环境

参考 `deploy/env.production.example` 配置生产环境变量。

## API 文档

### 主要端点

- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表
- `GET /api/translate/locales` - 获取支持的语言
- `POST /api/translate/content` - 翻译内容

### 翻译服务

使用 DeepL API 提供自动翻译功能：

```bash
# 翻译文章
POST /api/translate/content
{
  "entryId": "article-id",
  "apiEndpoint": "articles",
  "locale": "zh-hans"
}
```

## 开发说明

### 项目结构
```
src/
├── api/                 # API路由和控制器
│   ├── article/        # 文章相关
│   ├── category/       # 分类相关
│   ├── tag/           # 标签相关
│   └── translate/     # 翻译服务
├── admin/              # 管理后台扩展
│   ├── components/    # 自定义组件
│   └── services/      # 服务类
└── config/            # 配置文件
```

### 自定义功能

- **翻译按钮**: 管理后台集成的一键翻译功能
- **多语言内容**: 支持中英文内容管理
- **API服务**: 封装的Strapi API调用服务

## 部署

### Render平台
1. 连接GitHub仓库
2. 设置环境变量
3. 配置构建命令: `npm run build`
4. 配置启动命令: `npm start`

### Docker生产环境
1. 修改 `docker-compose.yml` 中的环境变量
2. 使用生产数据库（PostgreSQL推荐）
3. 配置反向代理（Nginx推荐）

## 故障排除

### 常见问题

1. **端口冲突**: 确保1337端口未被占用
2. **权限问题**: 确保Docker有足够权限访问项目目录
3. **环境变量**: 检查所有必需的环境变量是否正确设置

### 日志查看
```bash
# 查看应用日志
docker-compose logs -f strapi

# 查看系统日志
docker logs strapi-backend
```

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request
