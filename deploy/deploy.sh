#!/bin/bash

# Strapi Docker 部署脚本
set -e

# 配置变量
PROJECT_NAME="strapi-backend"
CONTAINER_NAME="strapi-backend"
DEPLOY_PATH="/var/www/strapi-backend"
BACKUP_PATH="/var/backups/strapi"

echo "🚀 开始部署 Strapi 项目..."

# 创建备份目录
sudo mkdir -p $BACKUP_PATH

# 如果容器正在运行，先备份数据库
if docker ps | grep -q $CONTAINER_NAME; then
    echo "📦 备份当前数据库..."
    timestamp=$(date +"%Y%m%d_%H%M%S")
    docker exec strapi-postgres pg_dump -U strapi strapi > $BACKUP_PATH/strapi_backup_$timestamp.sql
    echo "✅ 数据库已备份到: $BACKUP_PATH/strapi_backup_$timestamp.sql"
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose down || true

# 拉取最新代码（如果是从 Git 仓库部署）
if [ -d ".git" ]; then
    echo "📥 拉取最新代码..."
    git pull origin main
fi

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Strapi 服务启动成功！"
    echo "🌐 访问地址: http://localhost:1337"
    echo "🔧 管理面板: http://localhost:1337/admin"
else
    echo "❌ 服务启动失败，请检查日志:"
    docker-compose logs
    exit 1
fi

# 显示容器状态
echo "📊 容器状态:"
docker-compose ps

echo "🎉 部署完成！" 