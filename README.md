# upcore-溯洄 官方落地页

## 项目信息

- **项目类型**: React + Vite + TypeScript 静态网站
- **构建工具**: Vite 6.2.0
- **React版本**: 19.2.3

## 项目结构

```
upcore-website/
├── components/          # React 组件
├── contexts/            # React Context
├── public/              # 静态资源目录（构建时会复制到 dist）
│   ├── images/          # 图片资源
│   │   ├── about/       # 关于页面图片
│   │   ├── app/         # APP 展示图片
│   │   ├── products/    # 产品图片
│   │   ├── service/     # 服务相关图片
│   │   ├── tech/        # 技术展示图片
│   │   └── logo.png     # Logo
│   └── vedio/           # 视频资源
│       ├── about.mp4
│       └── brushtooth.mp4
├── utils/               # 工具函数
├── App.tsx              # 主应用组件
├── index.tsx            # 入口文件
├── index.html           # HTML 模板
└── vite.config.ts       # Vite 配置
```

**重要说明**：

- `public/` 目录下的文件会在构建时原样复制到 `dist/` 目录
- 静态资源（图片、视频）必须放在 `public/` 目录下才能被正确打包
- 引用静态资源时使用绝对路径，如 `/images/logo.png`

## 本地开发

**前置条件**: Node.js 18+

1. 安装依赖:
   ```bash
   npm install
   ```
2. 设置环境变量:
   创建 `.env.local` 文件并添加你的 API 密钥
3. 运行开发服务器:
   ```bash
   npm run dev
   ```

***

# 网站部署指南

## 部署步骤

### 第一步：本地构建测试

1. **安装依赖**
   ```bash
   npm install
   ```
2. **构建生产版本**
   ```bash
   npm run build
   ```
   构建完成后会在项目根目录生成 `dist` 文件夹，包含所有静态文件。

   **构建输出示例**：
   ```
   dist/
   ├── index.html
   ├── assets/
   │   └── index-xxx.js
   ├── images/
   │   ├── about/
   │   ├── app/
   │   ├── products/
   │   ├── service/
   │   ├── tech/
   │   └── logo.png
   └── vedio/
       ├── about.mp4
       └── brushtooth.mp4
   ```
3. **本地预览构建结果**
   ```bash
   npm run preview
   ```
   默认会在 <http://localhost:4173> 启动预览服务器。

***

### 第二步：上传到服务器

**使用 scp 命令上传（推荐）**

```bash
# 上传前端文件
scp -P 13673 -r dist/* root@106.15.204.216:/var/www/website/

# 上传后端文件
scp -P 13673 -r server root@106.15.204.216:/var/www/website/
scp -P 13673 package.json root@106.15.204.216:/var/www/website/
scp -P 13673 package-lock.json root@106.15.204.216:/var/www/website/
scp -P 13673 .env.server root@106.15.204.216:/var/www/website/.env
```

**安装依赖**

```bash
cd /var/www/website
npm install --production
npm install -g pm2
```

**使用 FTP/SFTP 工具**

使用 FileZilla 或其他 FTP 工具，将 `dist/` 目录下的所有文件上传到服务器 `/var/www/website/` 目录。

***

### 第三步：服务器 Nginx 配置

**创建 Nginx 配置文件** `/etc/nginx/sites-available/upcore`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器IP
    
    root /var/www/website;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|mp4|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

**启用配置并重启 Nginx**

```bash
sudo ln -s /etc/nginx/sites-available/upcore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 可能遇到的问题及解决方案

### 1. 构建后 dist 目录缺少静态资源

**问题**: `npm run build` 后 dist 目录中没有 images 或 vedio 文件夹

**解决方案**:

- 确保静态资源放在 `public/` 目录下
- Vite 会自动将 `public/` 目录内容复制到 `dist/`
- 检查文件引用路径是否正确（使用绝对路径如 `/images/logo.png`）

### 2. 构建失败

**问题**: `npm run build` 报错

**解决方案**:

- 检查 Node.js 版本（建议 18+）
- 删除 `node_modules` 和 `package-lock.json`，重新安装
- 检查 TypeScript 类型错误
- 确保环境变量已正确配置

### 3. 页面刷新 404

**问题**: 刷新页面或直接访问子路由显示 404

**解决方案**:

- Nginx 配置中添加 `try_files $uri $uri/ /index.html;`
- 这是 SPA 应用的常见问题，需要服务器将所有请求重定向到 index.html

### 4. 静态资源加载失败

**问题**: 图片、视频、CSS、JS 文件加载 404

**解决方案**:

- 检查 `vite.config.ts` 中的 `base` 配置
- 如果部署在子目录，需要设置 `base: '/子目录名/'`
- 确保文件路径正确，区分大小写

### 5. 跨域问题

**问题**: API 请求被 CORS 策略阻止

**解决方案**:

- 在 Nginx 中添加 CORS 头：
  ```nginx
  add_header Access-Control-Allow-Origin *;
  add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
  ```
- 或在后端 API 服务器配置 CORS

### 6. 视频文件加载慢

**问题**: 视频文件较大，加载缓慢

**解决方案**:

- 开启 Nginx gzip 压缩
- 使用 CDN 加速
- 考虑视频压缩或使用流媒体服务

### 7. 环境变量丢失

**问题**: 构建后环境变量未生效

**解决方案**:

- 创建 `.env.production` 文件
- Vite 环境变量必须以 `VITE_` 开头才能暴露给客户端
- 修改代码中的 `process.env.GEMINI_API_KEY` 为 `import.meta.env.VITE_GEMINI_API_KEY`

### 8. 防火墙阻止访问

**问题**: 无法访问网站

**解决方案**:

- 开放 80（HTTP）和 443（HTTPS）端口
  ```bash
  sudo ufw allow 80
  sudo ufw allow 443
  ```
- 云服务器需在安全组中放行相应端口

***

## 部署检查清单

- [ ] 本地构建成功
- [ ] dist 目录包含 images 和 vedio 文件夹
- [ ] 本地预览正常
- [ ] 服务器环境已准备
- [ ] 文件已上传到服务器
- [ ] Nginx 配置正确
- [ ] 域名解析生效
- [ ] HTTPS 证书配置
- [ ] 所有页面可正常访问
- [ ] 静态资源加载正常
- [ ] 表单/API 功能正常
- [ ] 移动端适配正常

