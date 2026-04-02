# Docker 生产环境部署指南

> 适用项目：`my-store`（Medusa 后端 + Admin）、`my-store-storefront`（Next.js 前端）
> 基础设施：PostgreSQL + Redis + Nginx（SSL）
> 部署方式：单一 `docker-compose.yml` + GitHub Actions 自动化 CI/CD

---

## 目录

1. [架构概览](#1-架构概览)
2. [服务器环境准备](#2-服务器环境准备)
3. [目录结构与文件说明](#3-目录结构与文件说明)
4. [PostgreSQL 配置（账号密码 + 持久化）](#4-postgresql-配置账号密码--持久化)
5. [Redis 配置（密码 + 持久化）](#5-redis-配置密码--持久化)
6. [Nginx 配置 SSL 证书](#6-nginx-配置-ssl-证书)
7. [文件上传持久化](#7-文件上传持久化)
8. [环境变量配置](#8-环境变量配置)
9. [首次部署（手动）](#9-首次部署手动)
10. [GitHub Actions 自动化 CI/CD](#10-github-actions-自动化-cicd)
11. [常用运维命令](#11-常用运维命令)
12. [故障排查](#12-故障排查)

---

## 1. 架构概览

```
Internet
    │
    ▼
┌──────────┐  :80/:443
│  Nginx   │──────────────────────┐
└──────────┘                      │
     │                            │
     │  api.yourdomain.com        │  yourdomain.com
     ▼                            ▼
┌──────────┐                ┌───────────────┐
│  admin   │  :9000         │  storefront   │  :8000
│ (Medusa) │                │  (Next.js)    │
└──────────┘                └───────────────┘
     │                            │
     ▼                            │
┌──────────┐  ┌──────────┐       │
│ postgres │  │  redis   │◄──────┘
│  :5432   │  │  :6379   │
└──────────┘  └──────────┘
     │              │
     ▼              ▼
./data/postgres  ./data/redis   （宿主机持久化目录）
```

**服务端口**（容器内部，不对外暴露）：
| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | 5432 | 仅对内部网络开放 |
| redis | 6379 | 仅对内部网络开放 |
| admin | 9000 | Medusa API + Admin UI |
| storefront | 8000 | Next.js 前端 |
| nginx | 80/443 | 对外暴露 |

---

## 2. 服务器环境准备

### 2.1 安装 Docker 和 Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version          # Docker version 26.x.x
docker compose version    # Docker Compose version v2.x.x
```

### 2.2 初始化部署目录

```bash
mkdir -p /home/opt/ai-cross-stand
cd /home/opt/ai-cross-stand

# 上传 deploy/ 目录下的所有文件到此处
# 或通过 git clone 后进入 deploy/ 目录
```

### 2.3 创建必要的宿主机目录

```bash
# 在 deploy/ 目录下执行
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p uploads
mkdir -p nginx/logs
mkdir -p nginx/ssl/api      # api.yourdomain.com 的证书
mkdir -p nginx/ssl/store    # yourdomain.com 的证书
```

---

## 3. 目录结构与文件说明

```
deploy/
├── docker-compose.yml          # 主部署文件
├── .env                        # 环境变量（从 .env.example 复制后填写）
├── .env.example                # 环境变量模板
├── nginx/
│   ├── nginx.conf              # Nginx 主配置
│   ├── conf.d/
│   │   ├── admin.conf          # api.yourdomain.com 配置（反代 Medusa）
│   │   └── storefront.conf     # yourdomain.com 配置（反代 Next.js）
│   ├── ssl/
│   │   ├── api/                # api 域名 SSL 证书目录
│   │   │   ├── fullchain.pem
│   │   │   └── privkey.pem
│   │   └── store/              # 前端域名 SSL 证书目录
│   │       ├── fullchain.pem
│   │       └── privkey.pem
│   └── logs/                   # Nginx 访问/错误日志
├── data/
│   ├── postgres/               # PostgreSQL 数据文件（宿主机持久化）
│   └── redis/                  # Redis AOF 文件（宿主机持久化）
└── uploads/                    # Medusa 上传文件（宿主机持久化）
```

---

## 4. PostgreSQL 配置（账号密码 + 持久化）

### 4.1 密码配置原理

在 `docker-compose.yml` 中通过环境变量注入：

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: ${POSTGRES_USER}       # 数据库用户名
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD} # 数据库密码
    POSTGRES_DB: ${POSTGRES_DB}           # 默认数据库名
```

PostgreSQL 首次启动时会使用这三个变量自动创建用户和数据库。  
**重要**：这些环境变量只在数据目录为空时（首次初始化）生效。  
数据库初始化后，修改 `.env` 中的密码不会自动同步，需手动在 PostgreSQL 内更改。

### 4.2 数据持久化原理

```yaml
volumes:
  - ./data/postgres:/var/lib/postgresql/data
```

`./data/postgres` 是宿主机上的目录，容器中 PostgreSQL 的所有数据文件都存储在此。  
即使容器被删除，数据依然保留。重新 `docker compose up` 时会加载已有数据。

### 4.3 设置步骤

```bash
# 1. 在 .env 文件中配置
POSTGRES_USER=medusa
POSTGRES_PASSWORD=MyStr0ng#Passw0rd!        # 使用复杂密码
POSTGRES_DB=medusa_db

# 2. 确保数据目录存在
mkdir -p deploy/data/postgres

# 3. 启动（首次会自动初始化）
docker compose up -d postgres

# 4. 验证连接
docker compose exec postgres psql -U medusa -d medusa_db -c "\l"
```

### 4.4 备份与恢复

```bash
# 备份数据库
docker compose exec postgres pg_dump -U medusa medusa_db > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup_20260329.sql | docker compose exec -T postgres psql -U medusa -d medusa_db
```

---

## 5. Redis 配置（密码 + 持久化）

### 5.1 密码配置原理

通过 Redis 启动命令中的 `--requirepass` 参数设置密码：

```yaml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --requirepass ${REDIS_PASSWORD}    # 访问密码
    --appendonly yes                    # 开启 AOF 持久化
    --appendfsync everysec              # 每秒 fsync 一次（性能与安全的平衡）
```

连接字符串格式：`redis://:密码@redis:6379`（注意密码前有个冒号 `:`）

### 5.2 数据持久化原理

Redis 使用 AOF（Append Only File）模式持久化：

```yaml
volumes:
  - ./data/redis:/data
```

AOF 文件 `appendonly.aof` 存储在宿主机 `./data/redis/` 目录下。  
Redis 重启时会重放 AOF 文件恢复数据。

### 5.3 设置步骤

```bash
# 1. 在 .env 文件中配置
REDIS_PASSWORD=MyRedis#Passw0rd!

# 2. 确保数据目录存在
mkdir -p deploy/data/redis

# 3. 启动 Redis
docker compose up -d redis

# 4. 验证连接（需要提供密码）
docker compose exec redis redis-cli -a MyRedis#Passw0rd! ping
# 输出：PONG
```

---

## 6. Nginx 配置 SSL 证书

支持两种证书获取方式：**Let's Encrypt（免费自动续期）** 和 **商业证书（手动上传）**。

### 方式一：Let's Encrypt（推荐）

使用 `certbot` 在宿主机直接申请证书，然后挂载到 Nginx 容器。

#### 6.1 在宿主机安装 Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y certbot

# 或使用 snap
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### 6.2 申请证书（Standalone 模式，需先停止 Nginx）

```bash
# 停止 Nginx（释放 80 端口）
docker compose stop nginx

# 申请 api.yourdomain.com 的证书
sudo certbot certonly --standalone \
  -d api.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --non-interactive

# 申请 yourdomain.com 和 www.yourdomain.com 的证书
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --non-interactive
```

证书默认存储在 `/etc/letsencrypt/live/` 目录下。

#### 6.3 将证书复制到 deploy/nginx/ssl/

```bash
# api 域名证书
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem \
        /home/opt/ai-cross-stand/deploy/nginx/ssl/api/fullchain.pem
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem \
        /home/opt/ai-cross-stand/deploy/nginx/ssl/api/privkey.pem

# 前端域名证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem \
        /home/opt/ai-cross-stand/deploy/nginx/ssl/store/fullchain.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem \
        /home/opt/ai-cross-stand/deploy/nginx/ssl/store/privkey.pem

# 设置合适的文件权限
chmod 644 deploy/nginx/ssl/**/*.pem
```

#### 6.4 设置证书自动续期

Let's Encrypt 证书有效期为 90 天，需配置定时任务自动续期：

```bash
# 编辑 crontab
crontab -e

# 添加以下内容（每天凌晨 3 点检查）
0 3 * * * certbot renew --quiet && \
  cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem /home/opt/ai-cross-stand/deploy/nginx/ssl/api/fullchain.pem && \
  cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem /home/opt/ai-cross-stand/deploy/nginx/ssl/api/privkey.pem && \
  cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /home/opt/ai-cross-stand/deploy/nginx/ssl/store/fullchain.pem && \
  cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /home/opt/ai-cross-stand/deploy/nginx/ssl/store/privkey.pem && \
  docker exec $(docker ps -qf "name=nginx") nginx -s reload
```

### 方式二：商业证书（手动上传）

国内常见服务商（阿里云、腾讯云等）申请后会提供 `.pem` / `.key` 文件：

```bash
# 将证书文件重命名并上传到对应目录
# api.yourdomain.com：
deploy/nginx/ssl/api/fullchain.pem    ← 证书链文件（含中间证书）
deploy/nginx/ssl/api/privkey.pem      ← 私钥文件

# yourdomain.com：
deploy/nginx/ssl/store/fullchain.pem
deploy/nginx/ssl/store/privkey.pem

# 注意：有些服务商提供 .crt + .key，重命名即可
mv yourdomain_bundle.crt fullchain.pem
mv yourdomain.key privkey.pem
```

### 6.5 修改 Nginx 配置中的域名

编辑 `deploy/nginx/conf.d/admin.conf` 和 `storefront.conf`，将所有 `yourdomain.com` 替换为真实域名。

```bash
# 批量替换（在 deploy/ 目录执行）
sed -i 's/api\.yourdomain\.com/api.your-real-domain.com/g' nginx/conf.d/admin.conf
sed -i 's/yourdomain\.com/your-real-domain.com/g' nginx/conf.d/storefront.conf
```

### 6.6 测试 Nginx 配置

```bash
docker compose run --rm nginx nginx -t
```

---

## 7. 文件上传持久化

Medusa 默认将用户上传的文件存储在 `/app/uploads` 目录。  
通过 Docker 卷挂载，将其映射到宿主机：

```yaml
# docker-compose.yml 中
admin:
  volumes:
    - ./uploads:/app/uploads
```

**宿主机路径**：`deploy/uploads/`  
**容器内路径**：`/app/uploads`

### 注意事项

1. 确保宿主机目录存在且有正确权限：
   ```bash
   mkdir -p deploy/uploads
   chmod 755 deploy/uploads
   ```

2. 如果使用多台服务器（水平扩展），需将上传目录替换为共享存储（如 NFS、S3 等）。目前单机部署使用本地挂载即可。

3. **备份上传文件**：
   ```bash
   tar -czf uploads_backup_$(date +%Y%m%d).tar.gz deploy/uploads/
   ```

---

## 8. 环境变量配置

```bash
cd deploy/
cp .env.example .env
nano .env   # 或 vim .env
```

### 关键变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| `GITHUB_REPO` | GitHub 仓库拥有者/名称 | `myorg/ai-cross-stand` |
| `IMAGE_TAG` | 要部署的镜像标签 | `latest` 或 `sha-abc123` |
| `POSTGRES_USER` | PostgreSQL 用户名 | `medusa` |
| `POSTGRES_PASSWORD` | PostgreSQL 密码（强密码） | `Str0ng#Pass!` |
| `POSTGRES_DB` | 数据库名 | `medusa_db` |
| `REDIS_PASSWORD` | Redis 密码 | `Redis#Pass!` |
| `JWT_SECRET` | JWT 签名密钥（≥32位） | `openssl rand -base64 32` |
| `COOKIE_SECRET` | Cookie 签名密钥（≥32位） | `openssl rand -base64 32` |
| `STORE_CORS` | 前端允许访问后端的域名 | `https://yourdomain.com` |
| `ADMIN_CORS` | Admin 面板允许访问的域名 | `https://api.yourdomain.com` |
| `AUTH_CORS` | 认证服务 CORS | `https://yourdomain.com,https://api.yourdomain.com` |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | 前端调用后端 API 地址 | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_BASE_URL` | 前端自身域名 | `https://yourdomain.com` |

### 生成安全密钥

```bash
# 生成 JWT_SECRET 和 COOKIE_SECRET
openssl rand -base64 32
```

---

## 9. 首次部署（手动）

### 9.1 在服务器上登录 GitHub 容器镜像仓库

```bash
# 使用 GitHub Personal Access Token (PAT)
# 在 GitHub → Settings → Developer settings → Personal access tokens
# 创建 PAT，勾选 read:packages 权限

echo "your_github_pat" | docker login ghcr.io -u your-github-username --password-stdin
```

### 9.2 修改 Nginx 配置中的域名

```bash
# 替换为真实域名
sed -i 's/api\.yourdomain\.com/你的api域名/g' nginx/conf.d/admin.conf
sed -i 's/yourdomain\.com/你的前端域名/g' nginx/conf.d/storefront.conf
```

### 9.3 配置 SSL 证书

按照 [第 6 节](#6-nginx-配置-ssl-证书) 的步骤申请并放置证书。

### 9.4 启动所有服务

```bash
cd /home/opt/ai-cross-stand/deploy

# 首次启动（等待基础设施服务就绪）
docker compose up -d postgres redis
sleep 10

# 启动 Medusa（会自动运行数据库迁移）
docker compose up -d admin
sleep 20

# 创建 Medusa 管理员账号
docker compose exec admin npx medusa user -e admin@example.com -p your-admin-password

# 启动前端
docker compose up -d storefront

# 启动 Nginx
docker compose up -d nginx

# 查看所有服务状态
docker compose ps
```

### 9.5 验证部署

```bash
# 检查所有容器是否正常运行
docker compose ps

# 检查 Medusa 健康状态
curl -f https://api.yourdomain.com/health

# 检查前端
curl -f https://yourdomain.com
```

---

## 10. GitHub Actions 自动化 CI/CD

### 10.1 工作流程说明

项目包含两个工作流：

| 工作流文件 | 触发条件 | 说明 |
|-----------|---------|------|
| `deploy-admin.yml` | push main 且 `my-store/**` 有变动 | 构建并部署 Medusa 后端 |
| `deploy-storefront.yml` | push main 且 `my-store-storefront/**` 有变动 | 构建并部署 Next.js 前端 |

**完整流程**：
```
代码 push 到 main
    ↓
GitHub Actions 触发
    ↓
checkout 代码
    ↓
登录 ghcr.io
    ↓
docker build（多阶段构建）
    ↓
docker push 到 ghcr.io（标签：sha-xxxxx + latest）
    ↓
SSH 连接到生产服务器
    ↓
docker compose pull 最新镜像
    ↓
docker compose up -d --no-deps（零停机滚动更新）
    ↓
（admin）运行数据库迁移
```

### 10.2 配置 GitHub Secrets

在 GitHub 仓库页面 → **Settings** → **Secrets and variables** → **Actions**：

#### Secrets（加密，适合密码、密钥）

| Secret 名称 | 说明 | 如何获取 |
|------------|------|---------|
| `SERVER_HOST` | 服务器 IP 或域名 | 如 `123.123.123.123` |
| `SERVER_USER` | SSH 用户名 | 如 `ubuntu` 或 `root` |
| `SERVER_SSH_KEY` | SSH 私钥（PEM 格式完整内容） | 见下方说明 |
| `SERVER_DEPLOY_PATH` | 服务器上 deploy 目录绝对路径 | 如 `/home/opt/ai-cross-stand/deploy` |

#### Variables（明文，适合非敏感配置）

| Variable 名称 | 说明 | 示例 |
|--------------|------|------|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Medusa 后端地址 | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_BASE_URL` | 前端域名 | `https://yourdomain.com` |

### 10.3 生成 SSH 密钥对

```bash
# 在本地生成专用部署密钥（不要设置 passphrase）
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# 将公钥添加到服务器的 authorized_keys
ssh-copy-id -i ~/.ssh/deploy_key.pub user@your-server-ip
# 或手动追加：
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# 查看私钥内容（完整复制到 GitHub Secret SERVER_SSH_KEY）
cat ~/.ssh/deploy_key
```

私钥格式示例（完整复制，含 BEGIN/END 行）：
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA...
...
-----END OPENSSH PRIVATE KEY-----
```

### 10.4 在服务器上登录 ghcr.io

```bash
# 生产服务器上执行（需要 GitHub PAT，勾选 read:packages）
echo "your_github_pat" | docker login ghcr.io -u your-github-username --password-stdin
```

### 10.5 触发部署

```bash
# 推送代码到 main 分支即可触发
git add .
git commit -m "feat: 更新功能"
git push origin main
```

在 GitHub 仓库 → **Actions** 页面可实时查看部署进度。

---

## 11. 常用运维命令

```bash
# 进入 deploy/ 目录后执行
cd /home/opt/ai-cross-stand/deploy

# ── 查看服务状态 ────────────────────────────────────────────
docker compose ps

# ── 查看实时日志 ────────────────────────────────────────────
docker compose logs -f          # 全部服务
docker compose logs -f admin    # 只看 admin
docker compose logs -f nginx    # 只看 nginx

# ── 重启单个服务 ────────────────────────────────────────────
docker compose restart admin
docker compose restart nginx

# ── 更新服务（手动拉取最新镜像）──────────────────────────────
docker compose pull admin
docker compose up -d --no-deps admin

# ── 进入容器 Shell ──────────────────────────────────────────
docker compose exec admin sh
docker compose exec postgres psql -U medusa -d medusa_db
docker compose exec redis redis-cli -a ${REDIS_PASSWORD}

# ── 运行数据库迁移 ──────────────────────────────────────────
docker compose exec admin npx medusa migrations run

# ── 重新加载 Nginx 配置（不停机）────────────────────────────
docker compose exec nginx nginx -s reload

# ── 停止所有服务 ────────────────────────────────────────────
docker compose down

# ── 停止并删除数据卷（⚠️ 危险！会删除所有数据）──────────────
# docker compose down -v   # 慎用！
```

---

## 12. 故障排查

### 12.1 容器启动失败

```bash
# 查看具体错误
docker compose logs admin --tail=50
docker compose ps -a   # 查看退出状态
```

### 12.2 数据库连接失败

```bash
# 确认 postgres 健康
docker compose exec postgres pg_isready -U medusa

# 测试从 admin 容器连接数据库
docker compose exec admin sh -c 'node -e "const {Client}=require(\"pg\");const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>console.log(\"OK\")).catch(e=>console.error(e)).finally(()=>c.end())"'
```

### 12.3 Redis 连接失败

```bash
# 验证密码正确
docker compose exec redis redis-cli -a ${REDIS_PASSWORD} ping
```

### 12.4 443 端口无法访问

```bash
# 检查 nginx 配置语法
docker compose exec nginx nginx -t

# 检查证书文件是否存在
ls -la nginx/ssl/api/
ls -la nginx/ssl/store/

# 检查服务器防火墙是否放行 80/443
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 12.5 文件上传失败

```bash
# 检查目录权限
ls -la uploads/
# 如果 admin 用 node 用户(uid=1000)运行
sudo chown -R 1000:1000 uploads/
```

### 12.6 镜像拉取失败（ghcr.io 认证）

```bash
# 重新登录
docker login ghcr.io -u your-github-username
# 确认 PAT 有 read:packages 权限
```
