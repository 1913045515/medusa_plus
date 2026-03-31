# Docker 镜像构建与推送命令手册

> 适用镜像仓库：腾讯云 TCR（hkccr.ccs.tencentyun.com）
> 项目：my-store（Medusa 后端）、my-store-storefront（Next.js 前端）

---

## 目录

1. [前置条件](#1-前置条件)
2. [登录腾讯云镜像仓库](#2-登录腾讯云镜像仓库)
3. [构建后端镜像（my-store）](#3-构建后端镜像my-store)
4. [构建前端镜像（my-store-storefront）](#4-构建前端镜像my-store-storefront)
5. [推送镜像到腾讯云 TCR](#5-推送镜像到腾讯云-tcr)
6. [常用运维命令](#6-常用运维命令)
7. [环境变量说明](#7-环境变量说明)
8. [常见问题](#8-常见问题)

---

## 1. 前置条件

- 已安装 Docker（`docker --version` 验证）
- 所有命令在**仓库根目录**（包含 `my-store/` 和 `my-store-storefront/` 的目录）执行

---

## 2. 登录腾讯云镜像仓库

```bash
docker login hkccr.ccs.tencentyun.com --username=<你的腾讯云账号ID>
# 根据提示输入密码
```

> ⚠️ 不要在命令行中明文传递密码，推荐使用 `--password-stdin`：
> ```bash
> echo "<密码>" | docker login hkccr.ccs.tencentyun.com --username=<账号ID> --password-stdin
> ```

---

## 3. 构建后端镜像（my-store）

后端镜像不需要构建时注入业务变量，数据库等敏感配置在容器运行时通过环境变量注入。

```bash
docker build -f my-store/Dockerfile -t my-store:latest .
```

### 打标签并推送

```bash
docker tag my-store:latest hkccr.ccs.tencentyun.com/website-pro/medusa_plus_pro:<tag>
docker push hkccr.ccs.tencentyun.com/website-pro/medusa_plus_pro:<tag>
```

`<tag>` 可以是 `latest`、日期版本号（如 `20260401`）或 git commit hash。

---

## 4. 构建前端镜像（my-store-storefront）

### 4.1 重要说明

前端使用 Next.js，`NEXT_PUBLIC_*` 开头的环境变量会在 `next build` 编译时**静态内嵌到 JS bundle** 中。
因此这些变量必须在 Docker 构建阶段通过 `--build-arg` 传入，运行时修改无效。

### 4.2 构建命令

```bash
docker build -f my-store-storefront/Dockerfile \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_你的publishable_key \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.你的域名.com \
  --build-arg NEXT_PUBLIC_BASE_URL=https://你的域名.com \
  --build-arg NEXT_PUBLIC_DEFAULT_REGION=cn \
  -t my-store-storefront:latest .
```

### 4.3 打标签并推送

```bash
docker tag my-store-storefront:latest hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:<tag>
docker push hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:<tag>
```

### 4.4 PowerShell（Windows 本地）写法

Windows PowerShell 换行符使用反引号 `` ` ``，环境变量使用 `$env:` 前缀：

```powershell
docker build -f my-store-storefront/Dockerfile `
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$env:NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY `
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=$env:NEXT_PUBLIC_MEDUSA_BACKEND_URL `
  --build-arg NEXT_PUBLIC_BASE_URL=$env:NEXT_PUBLIC_BASE_URL `
  --build-arg NEXT_PUBLIC_DEFAULT_REGION=$env:NEXT_PUBLIC_DEFAULT_REGION `
  -t my-store-storefront:latest .
```

---

## 5. 推送镜像到腾讯云 TCR

### 完整流程（以前端为例）

```bash
# 1. 登录
docker login hkccr.ccs.tencentyun.com --username=<账号ID>

# 2. 构建
docker build -f my-store-storefront/Dockerfile \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_BASE_URL=https://example.com \
  --build-arg NEXT_PUBLIC_DEFAULT_REGION=cn \
  -t my-store-storefront:latest .

# 3. 打标签
docker tag my-store-storefront:latest \
  hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:latest

# 4. 推送
docker push hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:latest
```

### 已有本地镜像直接推送

如果本地已经构建好镜像，只需打标签再推送：

```bash
# 查看本地镜像
docker images | grep my-store

# 打标签（可用镜像ID或名称）
docker tag my-store-storefront:latest \
  hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:latest

# 推送
docker push hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:latest
```

---

## 6. 常用运维命令

```bash
# 查看本地所有镜像
docker images

# 查看运行中的容器
docker ps

# 删除本地镜像
docker rmi <镜像ID或名称>

# 清理未使用的镜像和缓存（释放磁盘空间）
docker system prune -a

# 强制重新构建（不使用缓存）
docker build --no-cache -f my-store-storefront/Dockerfile \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_BASE_URL=https://example.com \
  -t my-store-storefront:latest .

# 查看镜像构建历史
docker history my-store-storefront:latest
```

---

## 7. 环境变量说明

### 构建时变量（通过 --build-arg 传入，写入镜像）

仅前端镜像需要，值会被编译进 JS bundle。

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | ✅ | Medusa Admin > Settings > API Keys 中创建 |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | ✅ | 后端 API 地址，如 `https://api.example.com` |
| `NEXT_PUBLIC_BASE_URL` | ✅ | 前端站点地址，如 `https://example.com` |
| `NEXT_PUBLIC_DEFAULT_REGION` | 否 | 默认区域，默认值 `cn` |

### 运行时变量（通过 docker-compose / docker run -e 注入，可替换）

后端敏感配置，**不要**写入镜像。

| 变量 | 说明 |
|------|------|
| `POSTGRES_USER` | 数据库用户名 |
| `POSTGRES_PASSWORD` | 数据库密码 |
| `POSTGRES_DB` | 数据库名 |
| `REDIS_PASSWORD` | Redis 密码 |
| `JWT_SECRET` | JWT 签名密钥 |
| `COOKIE_SECRET` | Cookie 签名密钥 |
| `STORE_CORS` | 前端 CORS 域名 |
| `ADMIN_CORS` | Admin CORS 域名 |
| `AUTH_CORS` | 认证 CORS 域名 |
| `REVALIDATE_SECRET` | Next.js ISR 重验证密钥 |

---

## 8. 常见问题

### Q: 构建前端镜像报 "Missing required environment variables"

**原因**：`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` 未传入构建。

**解决**：构建时必须通过 `--build-arg` 传入，详见 [第 4 节](#4-构建前端镜像my-store-storefront)。

### Q: 本地能构建成功，腾讯云/Jenkins 失败

**原因**：本地项目目录中有 `.env.local` 文件，Next.js 构建时会自动读取。Jenkins 从 Git 拉代码不包含此文件。

**解决**：确保 Jenkins 构建命令包含 `--build-arg`，不依赖本地 `.env.local`。

### Q: 前端环境变量可以在运行时替换吗？

`NEXT_PUBLIC_*` 变量在编译时写入 JS bundle，运行时替换无效。  
如需切换环境，需重新构建镜像。  
数据库密码等后端变量可以在运行时通过 `docker run -e` 或 `docker-compose.yml` 的 `environment` 替换。

### Q: 镜像仓库地址格式

```
hkccr.ccs.tencentyun.com/website-pro/medusa_plus_pro:<tag>        # 后端
hkccr.ccs.tencentyun.com/website-pro/medusa_plus_front_pro:<tag>   # 前端
```
