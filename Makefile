CONTAINER_PROD = neighborly-frontend
CONTAINER_DEV  = neighborly-frontend-dev

COMPOSE_PROD = docker compose -f docker-compose.yml
COMPOSE_DEV  = docker compose -f docker-compose.dev.yml

.DEFAULT_GOAL := help

# =========================
# === 🛠️ Development
# =========================
.PHONY: dev dev-down logs-dev restart-dev ps-dev

dev: ensure-network
	@echo "🚀 Starting development environment for $(CONTAINER_DEV)..."
	$(COMPOSE_DEV) up -d

dev-down:
	@echo "Stopping development container..."
	$(COMPOSE_DEV) down --remove-orphans

logs-dev:
	$(COMPOSE_DEV) logs -f $(CONTAINER_DEV)

restart-dev:
	$(COMPOSE_DEV) restart $(CONTAINER_DEV)

ps-dev:
	$(COMPOSE_DEV) ps

# =========================
# === ✨ Code Quality
# =========================
.PHONY: build-local lint test format

build-local:
	pnpm build

lint:
	pnpm lint

test:
	pnpm test

format:
	pnpm format

# =========================
# === 🐳 Production
# =========================
.PHONY: build prod prod-down logs-prod restart-prod deploy

build:
	docker build . -t neighborly-frontend:latest

prod:
	@echo "🚀 Starting production environment..."
	$(COMPOSE_PROD) up -d

prod-down:
	@echo "Stopping production container..."
	$(COMPOSE_PROD) down --remove-orphans

logs-prod:
	$(COMPOSE_PROD) logs -f $(CONTAINER_PROD)

restart-prod:
	$(COMPOSE_PROD) restart $(CONTAINER_PROD)

deploy:
	@echo "🔄 Pulling latest changes from origin/main..."
	@git pull origin main
	@echo "♻️  Rebuilding and restarting the service..."
	$(COMPOSE_PROD) up -d --build

# =========================
# === 🧹 Utilities
# =========================
.PHONY: ensure-network prune help

ensure-network:
	@echo "Checking for shared network..."
	@sh ./internal-net.sh

prune:
	docker system prune -a --volumes

help:
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
