#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${DEPLOY_DIR}/.env"
COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.yml"
TARGET_DB="${1:-medusa-my-store}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ -f "${ENV_FILE}" ]] || error ".env 文件不存在：${ENV_FILE}"
command -v docker >/dev/null 2>&1 || error "未找到 docker"
docker compose version >/dev/null 2>&1 || error "未找到 docker compose v2"

POSTGRES_USER=$(grep '^POSTGRES_USER=' "${ENV_FILE}" | sed 's/^POSTGRES_USER=//' | tr -d '"' | tr -d "'" || true)
[[ -n "${POSTGRES_USER}" ]] || error "无法从 .env 中读取 POSTGRES_USER"

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

info "启动 PostgreSQL 服务..."
compose_cmd up -d postgres

info "等待 PostgreSQL 就绪..."
READY=0
for i in $(seq 1 30); do
  if compose_cmd exec -T postgres pg_isready -U "${POSTGRES_USER}" -d postgres >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done
[[ ${READY} -eq 1 ]] || error "PostgreSQL 未就绪，请检查日志：docker compose --env-file .env -f docker-compose.yml logs postgres"

DB_EXISTS=$(compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${TARGET_DB}'" | tr -d '[:space:]')

if [[ "${DB_EXISTS}" == "1" ]]; then
  info "数据库 ${TARGET_DB} 已存在，跳过创建"
  exit 0
fi

info "创建数据库 ${TARGET_DB} ..."
compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${TARGET_DB}\""

VERIFY=$(compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${TARGET_DB}'" | tr -d '[:space:]')
[[ "${VERIFY}" == "1" ]] || error "数据库 ${TARGET_DB} 创建后校验失败"

info "数据库 ${TARGET_DB} 创建成功 ✓"