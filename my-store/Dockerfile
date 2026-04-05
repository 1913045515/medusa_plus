# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 切换 Alpine apk 为阿里云镜像加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建依赖（node-gyp 等原生模块需要python/make）
RUN apk add --no-cache python3 make g++

# 先复制 package 文件利用 Docker 层缓存
COPY my-store/package.json my-store/package-lock.json* ./
RUN npm ci --registry=https://registry.npmmirror.com

# 复制源码并构建
COPY my-store/ .
RUN npm run build

# ============================================================
# Stage 2: Production Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 切换 Alpine apk 为阿里云镜像加速
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装运行时依赖（su-exec 用于在 entrypoint 中安全降权到 node 用户）
RUN apk add --no-cache dumb-init su-exec

# 复制构建产物和全部依赖（避免遗漏 .medusa/build admin UI 等文件）
COPY --from=builder /app /app

# 创建上传目录；运行时通过 entrypoint chown，此处仅保证目录存在
RUN mkdir -p /app/uploads

# 创建 entrypoint 脚本：以 root 启动，修复 volume 挂载权限后降权到 node 运行
RUN printf '#!/bin/sh\nset -e\n# Fix ownership of the uploads volume mount (may be owned by host root)\nchown -R node:node /app/uploads\nexec su-exec node "$@"\n' \
    > /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 9000

# 以 root 启动 entrypoint（entrypoint 内部会降权到 node）
ENTRYPOINT ["dumb-init", "--", "docker-entrypoint.sh"]
# medusa build 将 admin UI 输出到 .medusa/server/public/admin/
# medusa start 从 process.cwd() 查找 ./public/admin，因此需从 .medusa/server/ 目录启动
CMD ["sh", "-c", "cd /app/.medusa/server && /app/node_modules/.bin/medusa start"]
