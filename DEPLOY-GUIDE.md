# RSSHub 自定义聚合部署指南

## 项目说明

在标准 RSSHub 基础上新增了 `/my/twitter/all` 聚合路由，将 50+ 个 Twitter 账号的推文合并为一个 RSS Feed。

### 自定义文件

- `lib/routes/my/namespace.ts` — 路由命名空间
- `lib/routes/my/twitter-all.ts` — 聚合路由主逻辑
- `lib/routes/my/twitter-accounts.ts` — 账号配置文件（增删账号只需修改此文件）

---

## 一、本地运行

```bash
# 1. 进入项目目录
cd ~/Documents/RSSHub

# 2. 复制并编辑环境变量
cp .env.example .env
# 编辑 .env，填入你的 TWITTER_AUTH_TOKEN

# 3. 安装依赖（如已安装可跳过）
pnpm install

# 4. 启动开发服务器
pnpm run dev

# 5. 验证
# 单个用户：http://localhost:1200/twitter/user/karpathy
# 聚合 Feed：http://localhost:1200/my/twitter/all
```

---

## 二、获取 Twitter auth_token

1. 用浏览器登录 https://x.com
2. 打开开发者工具（F12）→ Application → Cookies → `https://x.com`
3. 找到 `auth_token`，复制其 Value
4. 填入 `.env` 文件的 `TWITTER_AUTH_TOKEN=`
5. 可配置多个 token（逗号分隔），RSSHub 会自动轮询使用，降低被限速风险

---

## 三、部署到 Railway（推荐）

### 步骤

1. **Fork 或推送到 GitHub**

    将修改后的 RSSHub 推送到你自己的 GitHub 仓库：

    ```bash
    cd ~/Documents/RSSHub
    git remote set-url origin https://github.com/YOUR_USERNAME/RSSHub.git
    # 或者新增 remote
    git remote add mine https://github.com/YOUR_USERNAME/RSSHub.git
    git add -A
    git commit -m "feat: add aggregated twitter feed route"
    git push mine main
    ```

2. **在 Railway 创建项目**
    - 访问 https://railway.app，用 GitHub 登录
    - 点击 "New Project" → "Deploy from GitHub repo"
    - 选择你 fork 的 RSSHub 仓库

3. **配置环境变量**

    在 Railway 项目的 Settings → Variables 中添加：

    | 变量名               | 值           | 说明                   |
    | -------------------- | ------------ | ---------------------- |
    | `PORT`               | `1200`       | Railway 会自动映射端口 |
    | `TWITTER_AUTH_TOKEN` | `你的token`  | 必填                   |
    | `CACHE_TYPE`         | `memory`     | 或配置 Redis           |
    | `NODE_ENV`           | `production` | 生产环境               |

4. **生成公网域名**
    - Settings → Networking → Generate Domain
    - Railway 会分配一个 `xxx.up.railway.app` 域名

5. **验证**

    ```
    https://xxx.up.railway.app/my/twitter/all
    ```

---

## 四、部署到 Render（备选）

1. 在 https://render.com 创建 "New Web Service"
2. 连接 GitHub 仓库
3. 配置：
    - **Build Command**: `pnpm install && pnpm run build`
    - **Start Command**: `pnpm run start`
    - **Environment Variables**: 同上
4. Render 会分配 `xxx.onrender.com` 域名

---

## 五、部署到 Fly.io（备选）

```bash
# 1. 安装 flyctl
brew install flyctl

# 2. 登录
fly auth login

# 3. 在项目目录初始化
cd ~/Documents/RSSHub
fly launch
# 选择区域，确认配置

# 4. 设置环境变量
fly secrets set TWITTER_AUTH_TOKEN=your_token_here

# 5. 部署
fly deploy

# 6. 查看 URL
fly status
```

---

## 六、修改订阅账号

编辑 `lib/routes/my/twitter-accounts.ts`，在对应分类的 `accounts` 数组中增删用户名即可。

示例 — 新增一个账号：

```typescript
{
    category: 'AI & ML',
    accounts: [
        'ylecun',
        'karpathy',
        'new_account_here',  // 新增
        // ...
    ],
},
```

修改后重新部署即可生效。

---

## 七、注意事项

- **缓存**：聚合路由默认 15 分钟缓存，避免频繁请求被 Twitter 限速
- **Token 轮询**：建议配置 2-3 个 auth_token（逗号分隔），降低单 token 被封风险
- **代理**：如果部署环境无法直接访问 Twitter，需配置 `PROXY_URI`
- **RSS 阅读器**：直接将 `https://your-domain/my/twitter/all` 添加到任何 RSS 阅读器即可
