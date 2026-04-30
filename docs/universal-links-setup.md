# Universal Links 配置指南

## 概述

本指南将帮助你配置 Universal Links，使 iOS 应用能够通过标准的 HTTP/HTTPS 链接打开，特别适用于微信登录等第三方登录流程。

## 已完成的网站配置

### 1. apple-app-site-association 文件
- 位置：`public/.well-known/apple-app-site-association`
- 包含 applinks、webcredentials 和 activitycontinuation 配置

### 2. Vercel 配置
- 更新了 `vercel.json`，排除 `.well-known/` 路径的重写
- 配置了正确的 Content-Type 头

### 3. Express 后端配置
- 添加了 Universal Links 路由作为备用方案
- 确保正确的 Content-Type 返回

## 需要完成的步骤

### 第一步：更新 apple-app-site-association 文件

编辑 `public/.well-known/apple-app-site-association` 文件，将以下占位符替换为你的实际值：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.yourapp",  // 替换这里
        "paths": [
          "/apple-app-site-association",
          "/.well-known/apple-app-site-association",
          "/auth/*",
          "/wechat/*",
          "/callback/*",
          "*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "TEAMID.com.yourcompany.yourapp"  // 替换这里
    ]
  },
  "activitycontinuation": {
    "apps": [
      "TEAMID.com.yourcompany.yourapp"  // 替换这里
    ]
  }
}
```

### 如何获取 TEAMID 和 Bundle ID

#### 1. 获取 Team ID
- 登录 [Apple Developer Portal](https://developer.apple.com/account/)
- 点击右上角你的名字 → "Membership Details"
- 在 "Team Information" 下找到 "Team ID"

#### 2. 获取 Bundle ID
- 打开 Xcode 项目
- 选择项目文件（最顶部）
- 选择 Target
- 在 "General" 标签页中找到 "Bundle Identifier"

### 第二步：在 Xcode 中配置 Associated Domains

1. 打开 Xcode 项目
2. 选择项目文件 → 选择 Target
3. 点击 "Signing & Capabilities" 标签
4. 点击 "+ Capability"，搜索并添加 "Associated Domains"
5. 在 "Domains" 列表中添加：
   ```
   applinks:yourdomain.com
   webcredentials:yourdomain.com
   activitycontinuation:yourdomain.com
   ```
   （将 `yourdomain.com` 替换为你的实际域名）

### 第三步：确保网站使用 HTTPS

Universal Links **必须**使用 HTTPS：
- 确保你的域名有有效的 SSL 证书
- Vercel 默认提供 HTTPS，无需额外配置

### 第四步：部署到 Vercel

将更改部署到 Vercel：
```bash
git add .
git commit -m "Add Universal Links configuration"
git push
```

## 测试 Universal Links

### 方法1：使用 Apple 的验证工具

访问 [Apple App Site Association Validator](https://branch.io/resources/aasa-validator/) 或使用 curl：

```bash
curl -v https://yourdomain.com/.well-known/apple-app-site-association
```

检查响应：
- Content-Type 应该是 `application/json`
- 状态码应该是 200
- 不应该有重定向

### 方法2：在 iOS 设备上测试

1. 在 Notes 应用中输入一个你的网站链接，例如 `https://yourdomain.com/auth/callback`
2. 长按链接
3. 如果配置正确，会看到 "在 [你的应用名] 中打开" 选项
4. 点击应该能打开你的应用

### 方法3：使用 Xcode 调试

1. 在 Xcode 中运行应用
2. 选择 "Debug" → "Open URL"
3. 输入你的 Universal Link，例如 `https://yourdomain.com/auth/callback`
4. 应用应该能被正确打开

## 微信登录集成（后续）

配置好 Universal Links 后，可以按以下步骤集成微信登录：

1. 在微信开放平台注册应用
2. 配置 Universal Links 为微信回调地址
3. 在应用中集成微信 SDK
4. 在网站上创建微信登录回调页面

## 常见问题

### Q: apple-app-site-association 文件没有被正确加载
A: 检查：
- 文件是否在 `.well-known` 文件夹中
- Content-Type 是否正确（application/json）
- 没有文件扩展名
- 使用 HTTPS 访问

### Q: 应用没有被链接打开
A: 检查：
- Team ID 和 Bundle ID 是否正确
- Xcode 中 Associated Domains 是否配置正确
- apple-app-site-association 中的 paths 是否包含你要测试的路径

### Q: 如何验证 apple-app-site-association 是否被 Apple 服务器抓取
A: Apple 会定期抓取，通常需要几小时到一天。可以通过日志或网络监控查看。

## 参考资源

- [Apple 官方文档 - Supporting Universal Links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Apple 官方文档 - Allow apps and websites to link to your content](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content)
- [微信开放平台 - iOS 接入指南](https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Access_Guide/iOS.html)

## 获取帮助

如果遇到问题，请检查：
1. 确认所有配置值（Team ID、Bundle ID、域名）正确
2. 查看服务器日志确认文件被正确访问
3. 使用 curl 测试文件访问
