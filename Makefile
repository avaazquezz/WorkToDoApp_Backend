# Makefile for WorkToDo Backend

# Default target
.DEFAULT_GOAL := help

# Colors for output
YELLOW := \033[33m
GREEN := \033[32m
BLUE := \033[34m
RESET := \033[0m

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)WorkToDo Backend - Available Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: dev
dev: ## Start development server with Docker
	docker-compose -f docker-compose.dev.yml up --build

.PHONY: dev-local
dev-local: ## Start development server locally (without Docker)
	npm run dev

.PHONY: test
test: ## Run tests with Docker
	docker-compose -f docker-compose.test.yml up --build

.PHONY: test-local
test-local: ## Run tests locally
	npm test

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	npm run test:watch

.PHONY: test-coverage
test-coverage: ## Generate test coverage report
	npm run test:coverage

.PHONY: prod
prod: ## Start production environment (with tests)
	docker-compose up --build

.PHONY: prod-no-tests
prod-no-tests: ## Start production environment (skip tests)
	docker-compose up --build app db adminer

.PHONY: clean
clean: ## Clean Docker containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose -f docker-compose.test.yml down -v

.PHONY: clean-all
clean-all: clean ## Clean everything including images
	docker system prune -a

.PHONY: logs
logs: ## Show application logs
	docker-compose logs -f app

.PHONY: logs-tests
logs-tests: ## Show test logs
	docker-compose logs tests

.PHONY: shell
shell: ## Access application container shell
	docker-compose exec app sh

.PHONY: db-shell
db-shell: ## Access database shell
	docker-compose exec db mysql -u root -p1234 worktodo

.PHONY: setup
setup: ## Initial project setup
	@echo "$(YELLOW)Setting up WorkToDo Backend...$(RESET)"
	chmod +x wait-for-it.sh
	@echo "$(GREEN)Setup complete!$(RESET)"

.PHONY: health
health: ## Check application health
	curl -s http://localhost:3001/health | jq .
