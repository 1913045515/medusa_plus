# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 安装构建依赖（node-gyp 等原生模块需要python/make）
RUN apk add --no-cache python3 make g++

# 先复制 package 文件利用 Docker 层缓存
COPY my-store/package.json my-store/package-lock.json* ./
RUN npm ci

# 复制源码并构建
COPY my-store/ .
RUN npm run build

# ============================================================
# Stage 2: Production Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 安装运行时依赖
RUN apk add --no-cache dumb-init

# 复制构建产物和依赖
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/medusa-config.ts ./medusa-config.ts

# 文件上传目录（宿主机挂载持久化）
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# 以非 root 用户运行，提升安全性
USER node

EXPOSE 9000

# dumb-init 作为 PID 1，正确处理信号
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
