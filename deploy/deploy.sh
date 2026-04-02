#!/usr/bin/env bash
# ==============================================================
# 一键生产部署脚本
# 适用系统：Ubuntu Server 24.04 LTS
# 依赖：docker compose v2（参考 docs/docker-install-ubuntu2404.md）
# 用法：bash deploy.sh [IMAGE_TAG]
#   IMAGE_TAG 可选，默认 latest；推荐传入 sha-xxxxxx 精确版本
#
# 示例：
#   bash deploy.sh                  # 部署 latest
#   bash deploy.sh sha-abc1234      # 部署指定版本
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
[[ ! -f "${ENV_FILE}" ]] && error ".env 文件不存在，请先执行：cp .env.example .env 并填写配置"
command -v docker &>/dev/null       || error "未找到 docker，请先安装（参考 docs/docker-install-ubuntu2404.md）"
docker compose version &>/dev/null  || error "未找到 docker compose v2，请先安装 docker-compose-plugin"

# ── 读取/覆盖 IMAGE_TAG ─────────────────────────────────────
IMAGE_TAG="${1:-}"
if [[ -n "${IMAGE_TAG}" ]]; then
  # 追加或更新 .env 中的 IMAGE_TAG
  if grep -q "^IMAGE_TAG=" "${ENV_FILE}"; then
    sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|" "${ENV_FILE}"
  else
    echo "IMAGE_TAG=${IMAGE_TAG}" >> "${ENV_FILE}"
  fi
  info "使用镜像版本：${IMAGE_TAG}"
else
  IMAGE_TAG=$(grep "^IMAGE_TAG=" "${ENV_FILE}" | cut -d= -f2 || echo "latest")
  info "使用 .env 中的镜像版本：${IMAGE_TAG}"
fi

# ── 创建必要目录 ────────────────────────────────────────────
info "检查持久化目录..."
mkdir -p \
  "${DEPLOY_DIR}/data/postgres" \
  "${DEPLOY_DIR}/data/redis" \
  "${DEPLOY_DIR}/uploads" \
  "${DEPLOY_DIR}/nginx/logs" \
  "${DEPLOY_DIR}/nginx/ssl/api" \
  "${DEPLOY_DIR}/nginx/ssl/store"

# ── 检查 SSL 证书 ───────────────────────────────────────────
check_cert() {
  local dir="$1" name="$2"
  if [[ ! -f "${dir}/fullchain.pem" || ! -f "${dir}/privkey.pem" ]]; then
    warn "SSL 证书缺失：${dir}/ 下无 fullchain.pem 或 privkey.pem"
    warn "请参考 docs/infrastructure-docker.md 中的证书申请章节"
    warn "跳过证书检查，Nginx 可能无法启动"
  else
    info "SSL 证书 [${name}] 存在 ✓"
  fi
}
check_cert "${DEPLOY_DIR}/nginx/ssl/api"   "api 域名"
check_cert "${DEPLOY_DIR}/nginx/ssl/store" "前端域名"

# ── 拉取最新镜像 ────────────────────────────────────────────
info "拉取最新镜像..."
$COMPOSE pull || warn "部分镜像拉取失败，将在启动时重试"

# ── 启动/更新基础设施（postgres、redis）─────────────────────
info "启动基础设施服务（postgres、redis）..."
$COMPOSE up -d postgres redis

info "等待数据库就绪..."
PG_USER=$(grep '^POSTGRES_USER=' "${ENV_FILE}" | sed 's/^POSTGRES_USER=//' | tr -d '"' | tr -d "'")
PG_READY=0
for i in $(seq 1 30); do
  if $COMPOSE exec -T postgres pg_isready -U "${PG_USER}" &>/dev/null; then
    PG_READY=1
    break
  fi
  sleep 2
done
[[ $PG_READY -eq 0 ]] && error "PostgreSQL 60s 内未就绪，请检查日志：$COMPOSE logs postgres"
info "PostgreSQL 已就绪 ✓"

# ── 滚动更新 admin ───────────────────────────────────────────
info "部署 admin 服务..."
$COMPOSE up -d --no-deps admin

info "等待 admin 健康检查通过..."
ADMIN_READY=0
for i in $(seq 1 30); do
  if $COMPOSE exec -T admin wget -qO- http://localhost:9000/health &>/dev/null; then
    ADMIN_READY=1
    break
  fi
  sleep 3
done
[[ $ADMIN_READY -eq 0 ]] && warn "admin 90s 内未通过健康检查，请查看日志：$COMPOSE logs admin --tail=50"
[[ $ADMIN_READY -eq 1 ]] && info "admin 健康检查通过 ✓"

# ── 运行数据库迁移 ───────────────────────────────────────────
info "运行数据库迁移..."
$COMPOSE exec -T admin npx medusa migrations run \
  && info "迁移完成 ✓" \
  || warn "迁移命令返回非零，请手动确认：docker compose exec admin npx medusa migrations run"

# ── 滚动更新 storefront ──────────────────────────────────────
info "部署 storefront 服务..."
$COMPOSE up -d --no-deps storefront

# ── 更新/重载 nginx ──────────────────────────────────────────
info "更新 nginx..."
if $COMPOSE ps nginx | grep -q "Up"; then
  $COMPOSE exec -T nginx nginx -t && $COMPOSE exec -T nginx nginx -s reload \
    && info "Nginx 配置重载 ✓"
else
  $COMPOSE up -d nginx
fi

# ── 结果汇总 ────────────────────────────────────────────────
echo ""
info "====== 部署完成 ======"
$COMPOSE ps
echo ""
info "查看日志：docker compose logs -f [admin|storefront|nginx]"
