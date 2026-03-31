# 基础设施 Docker 安装指南

> 本文档说明如何用 Docker Compose 替代宿主机原生安装 Node.js、PostgreSQL、Redis、Nginx。  
> 适用场景：本地开发环境搭建 / 生产服务器初始化。

---

## 目录

1. [为什么用 Docker 替代原生安装](#1-为什么用-docker-替代原生安装)
2. [安装 Docker 和 Docker Compose](#2-安装-docker-和-docker-compose)
3. [PostgreSQL（账号密码 + 持久化）](#3-postgresql账号密码--持久化)
4. [Redis（密码 + 持久化）](#4-redis密码--持久化)
5. [Node.js 运行环境](#5-nodejs-运行环境)
6. [Nginx（SSL 反向代理）](#6-nginxssl-反向代理)
7. [本地开发一键启动](#7-本地开发一键启动)
8. [生产环境一键部署](#8-生产环境一键部署)

---

## 1. 为什么用 Docker 替代原生安装

| 对比项 | 原生安装 | Docker |
|--------|---------|--------|
| 环境隔离 | ❌ 版本冲突风险 | ✅ 完全隔离 |
| 多环境一致性 | ❌ 需手动对齐 | ✅ 镜像保证一致 |
| 快速清理/重置 | ❌ 繁琐 | ✅ `docker compose down -v` |
| 版本切换 | ❌ 需 nvm/pyenv 等 | ✅ 改镜像 tag |
| 持久化管理 | ✅ 直接在磁盘 | ✅ Volume 挂载到宿主机 |

---

## 2. 安装 Docker 和 Docker Compose

### Linux（Ubuntu/Debian）

```bash
# 一键安装 Docker Engine（含 Compose v2）
curl -fsSL https://get.docker.com | sh

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 验证
docker --version              # Docker version 26.x.x
docker compose version        # Docker Compose version v2.x.x
```

### macOS

安装 [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)，已内置 Compose v2。

### Windows

安装 [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)，已内置 Compose v2。

---

## 3. PostgreSQL（账号密码 + 持久化）

### 工作原理

| 机制 | 说明 |
|------|------|
| 账号密码 | 通过 `POSTGRES_USER` / `POSTGRES_PASSWORD` 环境变量在**首次初始化**时写入 |
| 数据持久化 | 将容器内 `/var/lib/postgresql/data` 映射到宿主机目录 |
| 重启不丢数 | 宿主机目录存在即可，新容器启动后自动加载 |

### 最小配置片段

```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: YourStrongPassword!
      POSTGRES_DB: medusa_db
    volumes:
      - ./data/postgres:/var/lib/postgresql/data   # 宿主机持久化
    ports:
      - "5432:5432"   # 开发环境暴露；生产环境可去掉
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U medusa"]
      interval: 5s
      retries: 10
```

### 连接字符串格式

```
postgresql://用户名:密码@localhost:5432/数据库名
# 容器间访问（同 compose 网络内）：
postgresql://medusa:YourStrongPassword!@postgres:5432/medusa_db
```

### 常用操作

```bash
# 进入 psql 交互
docker compose exec postgres psql -U medusa -d medusa_db

# 备份
docker compose exec postgres pg_dump -U medusa medusa_db > backup.sql

# 恢复
cat backup.sql | docker compose exec -T postgres psql -U medusa -d medusa_db

# 修改密码（初始化后）
docker compose exec postgres psql -U medusa -c "ALTER USER medusa PASSWORD 'NewPass!';"
```

> ⚠️ `POSTGRES_PASSWORD` 环境变量只在数据目录为空（首次初始化）时生效。  
> 若要修改已有密码，需在 psql 内执行 `ALTER USER`。

---

## 4. Redis（密码 + 持久化）

### 工作原理

| 机制 | 说明 |
|------|------|
| 密码 | 通过启动参数 `--requirepass` 设置，客户端连接时必须提供 |
| AOF 持久化 | `--appendonly yes`：每次写操作追加到文件，重启后重放恢复数据 |
| 持久化目录 | 将容器内 `/data` 映射到宿主机 |

### 最小配置片段

```yaml
services:
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --requirepass YourRedisPassword!
      --appendonly yes
      --appendfsync everysec
    volumes:
      - ./data/redis:/data    # AOF 文件持久化到宿主机
    ports:
      - "6379:6379"           # 开发环境暴露；生产环境可去掉
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "YourRedisPassword!", "ping"]
      interval: 5s
      retries: 10
```

### 连接字符串格式

```
# 带密码
redis://:YourRedisPassword!@localhost:6379
# 容器间访问（同 compose 网络内）：
redis://:YourRedisPassword!@redis:6379
```

### 常用操作

```bash
# 进入 redis-cli（需提供密码）
docker compose exec redis redis-cli -a YourRedisPassword!

# 查看内存使用
docker compose exec redis redis-cli -a YourRedisPassword! info memory

# 清空所有缓存（慎用）
docker compose exec redis redis-cli -a YourRedisPassword! FLUSHALL

# 查看 AOF 文件大小
ls -lh data/redis/appendonly.aof
```

---

## 5. Node.js 运行环境

Node.js 应用（Medusa 后端、Next.js 前端）通过 **多阶段 Dockerfile** 构建为镜像，不需要在宿主机安装 Node.js。

### 构建产物说明

| 服务 | 构建方式 | 产物 |
|------|---------|------|
| Medusa (`my-store`) | `npm run build` → `.medusa/` | 生产可运行目录 |
| Next.js (`my-store-storefront`) | `next build` + `output: standalone` | `.next/standalone/` 极小镜像 |

### 关于 standalone 模式

`next.config.js` 中 `output: "standalone"` 会将 Next.js 编译为一个**自包含的 Node.js 服务器**，只包含实际用到的 node_modules，镜像体积大幅减小：

```
普通构建：~500MB
standalone：~80-150MB
```

---

## 6. Nginx（SSL 反向代理）

### 工作原理

Nginx 作为**唯一对外暴露**的服务，负责：

1. HTTP → HTTPS 跳转
2. SSL 终止（TLS 握手在 Nginx 层完成，内部网络走 HTTP）
3. 按域名路由到对应的后端服务

```
Internet (HTTPS) → Nginx :443 → admin:9000 (api.yourdomain.com)
                              → storefront:8000 (yourdomain.com)
```

### SSL 证书申请（Let's Encrypt 免费证书）

```bash
# 1. 安装 certbot（宿主机执行）
sudo apt install -y certbot      # Ubuntu/Debian
# 或
sudo snap install --classic certbot

# 2. 停止 Nginx 释放 80 端口
docker compose stop nginx  # 或 make stop（若已启动）

# 3. 申请证书
sudo certbot certonly --standalone \
  -d api.yourdomain.com \
  --email your@email.com --agree-tos --non-interactive

sudo certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --email your@email.com --agree-tos --non-interactive

# 4. 复制到 deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem deploy/nginx/ssl/api/
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem   deploy/nginx/ssl/api/
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem     deploy/nginx/ssl/store/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem       deploy/nginx/ssl/store/

# 5. 重启 Nginx
docker compose up -d nginx
```

### SSL 证书自动续期

```bash
# 编辑 crontab（每天凌晨 3 点检查）
crontab -e

# 添加：
0 3 * * * certbot renew --quiet \
  && cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem /opt/deploy/nginx/ssl/api/ \
  && cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem /opt/deploy/nginx/ssl/api/ \
  && cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/deploy/nginx/ssl/store/ \
  && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/deploy/nginx/ssl/store/ \
  && docker exec $(docker ps -qf "name=nginx") nginx -s reload
```

### 商业证书上传

各服务商下载的证书通常包含 `.crt`（证书链）和 `.key`（私钥），重命名后放入对应目录：

```bash
# api 域名
mv api_bundle.crt deploy/nginx/ssl/api/fullchain.pem
mv api_server.key deploy/nginx/ssl/api/privkey.pem

# 前端域名
mv store_bundle.crt deploy/nginx/ssl/store/fullchain.pem
mv store_server.key deploy/nginx/ssl/store/privkey.pem
```

---

## 7. 本地开发一键启动

项目根目录已提供 `docker-compose.dev.yml`，只包含 PostgreSQL 和 Redis，应用仍用 `npm run dev` 启动。

```bash
# 方式一：直接用 make（推荐）
make dev-up

# 方式二：直接用 docker compose
docker compose -f docker-compose.dev.yml up -d

# 停止
make dev-down
```

启动后本地可访问：
- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`

然后按各子项目的 README 配置好 `.env` 后运行：

```bash
# 启动 Medusa 后端
cd my-store && npm run dev

# 启动 Next.js 前端（新终端）
cd my-store-storefront && npm run dev
```

---

## 8. 生产环境一键部署

```bash
cd deploy/

# 首次：复制并填写配置
cp .env.example .env
nano .env            # 填写域名、密码、密钥等

# 一键部署（所有服务）
bash deploy.sh

# 或通过 Makefile
make deploy          # 部署 latest
make deploy TAG=sha-abc1234   # 部署指定版本
```

脚本自动完成：创建目录 → 拉取镜像 → 启动基础设施 → 等待健康 → 滚动更新 admin → 运行数据库迁移 → 更新 storefront → 重载 Nginx。
