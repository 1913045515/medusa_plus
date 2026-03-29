# ==============================================================
# 快捷操作命令
# 用法：make <target>
#
# 生产环境操作在 deploy/ 目录执行；
# 本地开发操作在项目根目录执行。
# ==============================================================

# 默认目标：显示帮助
.DEFAULT_GOAL := help

DEPLOY_DIR := deploy

# ── 本地开发 ────────────────────────────────────────────────

## dev-up       启动本地开发基础设施（postgres + redis）
.PHONY: dev-up
dev-up:
	docker compose -f docker-compose.dev.yml up -d
	@echo "✅ 本地 PostgreSQL:5432 / Redis:6379 已启动"

## dev-down     停止本地开发基础设施
.PHONY: dev-down
dev-down:
	docker compose -f docker-compose.dev.yml down

## dev-logs     查看本地基础设施日志
.PHONY: dev-logs
dev-logs:
	docker compose -f docker-compose.dev.yml logs -f

## dev-clean    停止并删除本地开发数据（⚠️ 会清空数据库）
.PHONY: dev-clean
dev-clean:
	docker compose -f docker-compose.dev.yml down -v
	rm -rf data/dev/
	@echo "⚠️  本地开发数据已清除"

# ── 生产部署 ────────────────────────────────────────────────

## deploy       一键部署/更新所有服务（可传 TAG=sha-xxxxxx）
.PHONY: deploy
deploy:
	cd $(DEPLOY_DIR) && bash deploy.sh $(TAG)

## deploy-admin  仅更新 admin 服务
.PHONY: deploy-admin
deploy-admin:
	cd $(DEPLOY_DIR) && docker compose --env-file .env pull admin && \
	docker compose --env-file .env up -d --no-deps admin

## deploy-storefront  仅更新 storefront 服务
.PHONY: deploy-storefront
deploy-storefront:
	cd $(DEPLOY_DIR) && docker compose --env-file .env pull storefront && \
	docker compose --env-file .env up -d --no-deps storefront

## status       查看生产服务状态
.PHONY: status
status:
	cd $(DEPLOY_DIR) && docker compose --env-file .env ps

## logs         查看生产日志（SERVICE=admin|storefront|nginx|postgres|redis）
.PHONY: logs
logs:
	cd $(DEPLOY_DIR) && docker compose --env-file .env logs -f $(SERVICE)

## migrate      运行数据库迁移
.PHONY: migrate
migrate:
	cd $(DEPLOY_DIR) && docker compose --env-file .env exec admin npx medusa migrations run

## nginx-reload 重载 Nginx 配置（不停机）
.PHONY: nginx-reload
nginx-reload:
	cd $(DEPLOY_DIR) && docker compose --env-file .env exec nginx nginx -s reload

## stop         停止所有生产服务
.PHONY: stop
stop:
	cd $(DEPLOY_DIR) && docker compose --env-file .env down

# ── 帮助 ────────────────────────────────────────────────────

.PHONY: help
help:
	@echo ""
	@echo "可用命令："
	@echo ""
	@grep -E '^## ' $(MAKEFILE_LIST) | sed 's/## /  make /'
	@echo ""
