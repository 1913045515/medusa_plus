#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${DEPLOY_DIR}/.env"
COMPOSE_FILE="${DEPLOY_DIR}/docker-compose.yml"
DUMP_FILE="${DEPLOY_DIR}/sql/dump-medusa-my-store.sql"
TARGET_DB="${1:-medusa-my-store}"
TEMP_DB="tmp_restore_${TARGET_DB//[^a-zA-Z0-9_]/_}_$(date +%s)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

[[ -f "${ENV_FILE}" ]] || error ".env 文件不存在：${ENV_FILE}"
[[ -f "${DUMP_FILE}" ]] || error "SQL dump 文件不存在：${DUMP_FILE}"
command -v docker >/dev/null 2>&1 || error "未找到 docker"
docker compose version >/dev/null 2>&1 || error "未找到 docker compose v2"

POSTGRES_USER=$(grep '^POSTGRES_USER=' "${ENV_FILE}" | sed 's/^POSTGRES_USER=//' | tr -d '"' | tr -d "'" || true)
[[ -n "${POSTGRES_USER}" ]] || error "无法从 .env 中读取 POSTGRES_USER"

compose_cmd() {
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

extract_app_sql() {
  awk '
    /\\connect -reuse-previous=on "dbname='\''medusa-my-store'\''"/ { capture=1; next }
    capture { print }
  ' "${DUMP_FILE}"
}

drop_temp_db() {
  compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${TEMP_DB}\"" >/dev/null 2>&1 || true
}

trap drop_temp_db EXIT

info "确保目标数据库 ${TARGET_DB} 存在..."
bash "${DEPLOY_DIR}/ensure-medusa-db.sh" "${TARGET_DB}"

info "启动 PostgreSQL 服务..."
compose_cmd up -d postgres

info "创建临时数据库 ${TEMP_DB} ..."
drop_temp_db
compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${TEMP_DB}\""

info "将 dump 导入临时数据库 ${TEMP_DB} ..."
extract_app_sql | compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d "${TEMP_DB}" -v ON_ERROR_STOP=1

info "读取临时库中的表列表..."
mapfile -t SOURCE_TABLES < <(compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d "${TEMP_DB}" -tAc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")

if [[ ${#SOURCE_TABLES[@]} -eq 0 ]]; then
  warn "临时数据库中未解析到任何 public 表，跳过导入"
  exit 0
fi

IMPORTED_COUNT=0
SKIPPED_COUNT=0

for table_name in "${SOURCE_TABLES[@]}"; do
  clean_table_name="$(echo "${table_name}" | xargs)"
  [[ -n "${clean_table_name}" ]] || continue

  EXISTS=$(compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d "${TARGET_DB}" -tAc "SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='${clean_table_name}'" | tr -d '[:space:]')

  if [[ "${EXISTS}" == "1" ]]; then
    info "表 public.${clean_table_name} 已存在，跳过创建和导入"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  info "导入缺失表 public.${clean_table_name} ..."
  compose_cmd exec -T postgres pg_dump -U "${POSTGRES_USER}" -d "${TEMP_DB}" --no-owner --no-privileges --table "public.${clean_table_name}" | \
    compose_cmd exec -T postgres psql -U "${POSTGRES_USER}" -d "${TARGET_DB}" -v ON_ERROR_STOP=1
  IMPORTED_COUNT=$((IMPORTED_COUNT + 1))
done

info "导入完成：新增 ${IMPORTED_COUNT} 张表，跳过 ${SKIPPED_COUNT} 张已存在的表"