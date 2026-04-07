#!/usr/bin/env bash
# ==============================================================
# 测试环境一键部署脚本（PostgreSQL + Redis + Nginx + Admin）
# 适用系统：Ubuntu Server 24.04 LTS
# 用法：bash deploy-test.sh
# ==============================================================
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${DEPLOY_DIR}/.env"
COMPOSE="docker compose --env-file ${ENV_FILE} -f ${DEPLOY_DIR}/docker-compose.yml"

# ── 颜色输出 ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 前置检查 ────────────────────────────────────────────────
[[ ! -f "${ENV_FILE}" ]] && error ".env 文件不存在，请先执行：cp .env.test.example .env 并填写配置"
command -v docker &>/dev/null       || error "未找到 docker，请先安装（参考 docs/docker-install-ubuntu2404.md）"
docker compose version &>/dev/null  || error "未找到 docker compose v2，请先安装"

# ── 创建必要目录 ────────────────────────────────────────────
info "检查持久化目录..."
mkdir -p \
  "${DEPLOY_DIR}/data/postgres" \
  "${DEPLOY_DIR}/data/redis" \
  "${DEPLOY_DIR}/nginx/logs" \
  "${DEPLOY_DIR}/uploads"

# ── 拉取基础设施镜像（无需认证）────────────────────────────
info "拉取基础设施镜像..."
$COMPOSE pull postgres redis nginx || warn "部分基础设施镜像拉取失败"

# ── 登录腾讯云镜像仓库 ──────────────────────────────────────
REGISTRY_HOST="hkccr.ccs.tencentyun.com"
REGISTRY_USER="${TENCENT_REGISTRY_USER:-100003146322}"
REGISTRY_PASS=$(grep '^TENCENT_REGISTRY_PASSWORD=' "${ENV_FILE}" | sed 's/^TENCENT_REGISTRY_PASSWORD=//' | tr -d '"' | tr -d "'" || true)
if [[ -n "${REGISTRY_PASS}" ]]; then
  info "登录腾讯云镜像仓库..."
  echo "${REGISTRY_PASS}" | docker login "${REGISTRY_HOST}" --username="${REGISTRY_USER}" --password-stdin 2>&1 \
    && info "腾讯云镜像仓库登录成功 ✓" \
    || warn "镜像仓库登录失败，请检查 TENCENT_REGISTRY_PASSWORD 是否正确"
else
  # 尝试检测是否已有缓存凭据
  if grep -q "${REGISTRY_HOST}" ~/.docker/config.json 2>/dev/null; then
    info "使用已缓存的 docker 登录凭据"
  else
    warn "未在 .env 中找到 TENCENT_REGISTRY_PASSWORD 且无缓存凭据"
    warn "请在 .env 中添加 TENCENT_REGISTRY_PASSWORD=<密码> 或手动执行: docker login ${REGISTRY_HOST} --username=${REGISTRY_USER}"
  fi
fi

# ── 拉取业务镜像 ────────────────────────────────────────────
info "拉取 Admin 镜像..."
$COMPOSE pull admin || warn "Admin 镜像拉取失败，请检查仓库登录状态"

info "拉取 Storefront 镜像..."
$COMPOSE pull storefront || warn "Storefront 镜像拉取失败，请检查仓库登录状态"

# ── 启动基础设施 ────────────────────────────────────────────
info "启动基础设施服务（postgres、redis）..."
$COMPOSE up -d postgres redis

info "等待 PostgreSQL 就绪..."
PG_READY=0
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose --env-file "${ENV_FILE}" -f "${DEPLOY_DIR}/docker-compose.yml" ps -q postgres 2>/dev/null)" 2>/dev/null || echo "")
  if [[ "${STATUS}" == "healthy" ]]; then
    PG_READY=1
    break
  fi
  sleep 2
done
if [[ $PG_READY -eq 0 ]]; then
  $COMPOSE logs --tail=20 postgres
  error "PostgreSQL 60s 内未就绪"
fi
info "PostgreSQL 已就绪 ✓"

# ── 初始化业务数据库与基础数据 ─────────────────────────────
info "检查并初始化 medusa-my-store 数据库..."
bash "${DEPLOY_DIR}/ensure-medusa-db.sh" "medusa-my-store"

info "按缺失表导入 dump-medusa-my-store.sql ..."
bash "${DEPLOY_DIR}/import-medusa-dump-if-missing-tables.sh" "medusa-my-store"

info "等待 Redis 就绪..."
REDIS_READY=0
for i in $(seq 1 15); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose --env-file "${ENV_FILE}" -f "${DEPLOY_DIR}/docker-compose.yml" ps -q redis 2>/dev/null)" 2>/dev/null || echo "")
  if [[ "${STATUS}" == "healthy" ]]; then
    REDIS_READY=1
    break
  fi
  sleep 2
done
if [[ $REDIS_READY -eq 0 ]]; then
  $COMPOSE logs --tail=20 redis
  error "Redis 30s 内未就绪"
fi
info "Redis 已就绪 ✓"

# ── 启动 Admin ──────────────────────────────────────────────
info "启动 Admin 服务..."
$COMPOSE up -d admin

info "等待 Admin 容器启动..."
sleep 5

info "等待 Admin 就绪..."
ADMIN_READY=0
for i in $(seq 1 10); do
  if $COMPOSE exec -T admin wget -qO- http://localhost:9000/health &>/dev/null; then
    ADMIN_READY=1
    break
  fi
  sleep 3
done
if [[ $ADMIN_READY -eq 1 ]]; then
  info "Admin 已就绪 ✓"
else
  warn "Admin 30s 内未通过健康检查，请查看日志：$COMPOSE logs admin --tail=50"
fi

# ── 启动 Storefront ─────────────────────────────────────────
info "启动 Storefront 服务..."
$COMPOSE up -d storefront

info "等待 Storefront 就绪..."
SFRONT_READY=0
for i in $(seq 1 15); do
  if $COMPOSE exec -T storefront wget -qO- http://localhost:8000 &>/dev/null; then
    SFRONT_READY=1
    break
  fi
  sleep 3
done
if [[ $SFRONT_READY -eq 1 ]]; then
  info "Storefront 已就绪 ✓"
else
  warn "Storefront 45s 内未通过健康检查，请查看日志：$COMPOSE logs storefront --tail=50"
fi

# ── 启动 Nginx ──────────────────────────────────────────────
info "启动 Nginx..."
if $COMPOSE up -d nginx; then
  info "Nginx 启动成功 ✓"
else
  warn "Nginx 启动失败，请检查日志：$COMPOSE logs nginx"
  warn "其他服务仍正常运行，可继续访问"
fi

# ── 结果汇总 ────────────────────────────────────────────────
echo ""
info "====== 测试环境部署完成 ======"
$COMPOSE ps
echo ""
info "PostgreSQL  已暴露端口 5432，可通过外部工具连接"
info "Redis       已暴露端口 6379，可通过外部工具连接"
info "Admin       已暴露端口 9000  → https://admin.wolzq.com/app"
info "Storefront  内部 8000，通过 Nginx 对外暴露"
info "Nginx       监听端口 80     → https://www.wolzq.com"
echo ""
info "常用命令："
info "  查看日志：docker compose ... logs -f [postgres|redis|admin|storefront|nginx]"
info "  停止服务：$COMPOSE down"
info "  清除数据：$COMPOSE down -v && rm -rf ${DEPLOY_DIR}/data"
