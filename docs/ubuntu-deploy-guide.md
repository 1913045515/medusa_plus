# Ubuntu Server 24.04 部署指南

本文档说明如何将 `deploy/` 目录上传到 Ubuntu Server 24.04 并执行部署。

## 前置条件

- Ubuntu Server 24.04 LTS 64bit
- 已安装 Docker + Docker Compose（参考 [docker-install-ubuntu2404.md](docker-install-ubuntu2404.md)）
- 当前用户已加入 docker 组（免 sudo）

## 目录结构

在服务器上建议放置路径为 `/home/opt/ai-cross-stand/`（或自定义路径），结构如下：

```
/home/opt/ai-cross-stand/
├── .env                        # 环境变量（从模板复制并修改）
├── .env.example                # 生产环境变量模板
├── .env.test.example           # 测试环境变量模板
├── docker-compose.yml          # 生产环境（全服务）
├── docker-compose.test.yml     # 测试环境（仅基础设施）
├── deploy.sh                   # 生产部署脚本
├── deploy-test.sh              # 测试部署脚本
├── nginx/
│   ├── nginx.conf
│   ├── conf.d/
│   │   ├── admin.conf
│   │   └── storefront.conf
│   ├── ssl/                    # SSL 证书（手动上传）
│   │   ├── api/
│   │   │   ├── fullchain.pem
│   │   │   └── privkey.pem
│   │   └── store/
│   │       ├── fullchain.pem
│   │       └── privkey.pem
│   └── logs/                   # 自动创建
├── data/                       # 自动创建
│   ├── postgres/
│   └── redis/
└── uploads/                    # 自动创建
```

## 上传文件到服务器

### 方法一：scp 上传整个 deploy 目录

```bash
# 在本地项目根目录执行
scp -r deploy/ your-user@your-server-ip:/home/opt/ai-cross-stand/
```

### 方法二：rsync（推荐，支持增量同步）

```bash
rsync -avz --exclude='data/' --exclude='nginx/logs/' --exclude='nginx/ssl/' --exclude='.env' \
  deploy/ your-user@your-server-ip:/home/opt/ai-cross-stand/
```

### 方法三：git clone（如果服务器可访问仓库）

```bash
ssh your-user@your-server-ip
cd /opt
git clone your-repo-url ai-cross-stand-repo
cp -r ai-cross-stand-repo/deploy/ /home/opt/ai-cross-stand/
```

## 测试环境部署（仅 PostgreSQL + Redis + Nginx）

### 1. SSH 登录服务器

```bash
ssh your-user@your-server-ip
cd /home/opt/ai-cross-stand
```

### 2. 创建并编辑 .env 文件

```bash
cp .env.test.example .env
nano .env
```

修改密码为安全的随机值：

```bash
# 生成随机密码
openssl rand -base64 24
```

### 3. 赋予脚本执行权限并运行

```bash
chmod +x deploy-test.sh
bash deploy-test.sh
```

### 4. 验证服务

```bash
# 查看容器状态
docker compose -f docker-compose.test.yml ps

# 测试 PostgreSQL 连接
docker compose -f docker-compose.test.yml exec postgres psql -U medusa -d medusa_db -c "SELECT 1;"

# 测试 Redis 连接
docker compose -f docker-compose.test.yml exec redis redis-cli -a your_redis_password ping

# 查看日志
docker compose -f docker-compose.test.yml logs -f
```

### 5. 停止测试服务

```bash
docker compose --env-file .env -f docker-compose.test.yml down
```

## 生产环境部署（全部服务）

### 1. 创建并编辑 .env 文件

```bash
cp .env.example .env
nano .env
```

按模板中的注释逐项填写：
- GitHub 镜像仓库地址
- 数据库和 Redis 密码
- JWT / Cookie 密钥
- 域名和 CORS 配置
- Next.js 前端配置

课程媒体 S3 相关变量也必须填写：

- COURSE_MEDIA_S3_BUCKET=你的 S3 bucket 名称
- COURSE_MEDIA_S3_REGION=ap-southeast-1
- COURSE_MEDIA_S3_ACCESS_KEY_ID=服务端上传 IAM Access Key
- COURSE_MEDIA_S3_SECRET_ACCESS_KEY=服务端上传 IAM Secret Key
- COURSE_MEDIA_S3_MAX_FILE_SIZE_BYTES=2147483648
- COURSE_MEDIA_SIGNED_URL_TTL_SECONDS=7200

补充说明：

- 上述 S3 密钥只能放在服务器 .env 或密钥管理系统中，不能提交到仓库。
- 课程封面、Lesson 封面、Lesson 视频都由后端上传到 S3，浏览器不会直接持有 S3 长期凭证。
- 历史媒体不会自动迁移，只有重新上传后的媒体才会写入新的结构化 S3 元数据。

### 2. 上传 SSL 证书

```bash
# 将证书文件放到对应目录
scp fullchain.pem privkey.pem your-user@your-server-ip:/home/opt/ai-cross-stand/nginx/ssl/api/
scp fullchain.pem privkey.pem your-user@your-server-ip:/home/opt/ai-cross-stand/nginx/ssl/store/
```

### 3. 登录 GitHub Container Registry（拉取私有镜像）

```bash
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 4. 执行部署

```bash
chmod +x deploy.sh
bash deploy.sh              # 部署 latest 版本
# 或
bash deploy.sh sha-abc1234  # 部署指定版本
```

### 5. 查看部署状态

```bash
docker compose ps
docker compose logs -f admin
docker compose logs -f storefront
```

### 6. 验证课程媒体链路

部署完成后，至少执行一次以下检查：

```bash
# 检查后端环境变量是否注入成功
docker compose exec admin env | grep COURSE_MEDIA_

# 查看后端日志，确认没有 S3 鉴权或签名报错
docker compose logs --tail=200 admin
```

然后在浏览器中完成以下验证：

1. 进入 admin 课程管理页面，上传课程封面、Lesson 封面、Lesson 视频。
2. 确认后台仅显示文件名、类型、大小，不显示永久 S3 地址。
3. 打开 storefront 课程详情页，确认课程卡片和选集缩略图正常显示。
4. 播放一个免费 Lesson 和一个已购 Lesson，确认视频可正常拉取签名 URL。
5. 等待签名过期或临时调低 COURSE_MEDIA_SIGNED_URL_TTL_SECONDS，确认前台会显示“刷新访问授权”提示并可重新获取播放地址。

## 常用运维命令

```bash
# 查看所有容器状态
docker compose ps

# 查看某个服务日志
docker compose logs -f [postgres|redis|nginx|admin|storefront]

# 重启某个服务
docker compose restart nginx

# 停止所有服务
docker compose down

# 停止并清除数据（危险！）
docker compose down -v && rm -rf data/

# 进入 PostgreSQL 交互
docker compose exec postgres psql -U medusa -d medusa_db

# 进入 Redis 交互
docker compose exec redis redis-cli -a your_redis_password

# 查看磁盘使用
docker system df
```

## 注意事项

1. **`.env` 文件** 绝不能提交到 Git，包含敏感密钥
2. **SSL 证书** 测试环境可暂时不配置，但 Nginx 的 443 端口监听会失败；测试时可通过 80 端口访问
3. **防火墙** 确保服务器开放了 80、443 端口；测试环境如需外部访问 PostgreSQL/Redis，需额外开放 5432、6379
4. **数据备份** `data/postgres/` 和 `data/redis/` 目录包含持久化数据，建议定期备份
5. **权限** 如果遇到持久化目录权限问题，可执行：
   ```bash
   sudo chown -R 999:999 data/postgres/   # PostgreSQL 容器用户
   sudo chown -R 999:999 data/redis/      # Redis 容器用户
   ```
