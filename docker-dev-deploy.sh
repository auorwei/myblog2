#!/bin/bash

echo "=== Strapi 开发环境 Docker部署脚本 ==="

# 确保在正确的目录
if [ ! -f "docker-compose.simple.yml" ]; then
    echo "❌ 请在包含docker-compose.simple.yml的目录中运行此脚本"
    exit 1
fi

# 停止并清理现有容器（如果存在）
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.simple.yml down

# 检查数据库文件
echo "📊 检查开发环境数据库文件..."
if [ -f ".tmp/data.db" ]; then
    echo "✅ 本地数据库文件存在: .tmp/data.db"
    ls -lh .tmp/data.db
    echo "📊 数据库文件大小: $(du -sh .tmp/data.db | cut -f1)"
    
    # 备份数据库文件
    echo "💾 备份数据库文件..."
    cp .tmp/data.db .tmp/data.db.backup.$(date +%Y%m%d_%H%M%S)
else
    echo "❌ 数据库文件不存在，创建空目录..."
    mkdir -p .tmp
    echo "⚠️  注意：这将是一个空的数据库，需要重新创建数据"
fi

# 确保上传目录存在
echo "📁 检查上传目录..."
mkdir -p public/uploads

# 设置正确的权限
echo "🔑 设置目录权限..."
chmod 755 .tmp public/uploads

# 显示环境配置
echo "🔧 开发环境配置："
echo "  - NODE_ENV: development"
echo "  - DATABASE_CLIENT: sqlite"
echo "  - DATABASE_FILENAME: .tmp/data.db"
echo "  - 运行模式: npm run develop (热重载)"

# 构建并启动容器
echo "🚀 构建并启动开发环境Docker容器..."
docker-compose -f docker-compose.simple.yml up -d --build

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 15

# 检查容器状态
echo "📋 检查容器状态..."
docker ps | grep strapi-backend

# 检查数据挂载
echo "💽 检查数据挂载..."
echo "容器内 .tmp 目录："
docker exec strapi-backend ls -la /opt/app/.tmp/
echo "容器内数据库文件："
docker exec strapi-backend ls -lh /opt/app/.tmp/data.db 2>/dev/null || echo "❌ 数据库文件不存在"

# 检查环境变量
echo "🌍 检查环境变量..."
docker exec strapi-backend env | grep -E "NODE_ENV|DATABASE"

# 检查Node.js版本
echo "🔢 检查Node.js版本..."
docker exec strapi-backend node --version

# 显示日志
echo "📄 显示最近的日志..."
docker-compose -f docker-compose.simple.yml logs --tail=30

echo ""
echo "✅ 开发环境部署完成！"
echo "📱 访问地址：http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):1337"
echo "🔧 管理后台：http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):1337/admin"
echo ""
echo "📊 开发环境监控命令："
echo "  查看状态: docker ps"
echo "  查看日志: docker-compose -f docker-compose.simple.yml logs -f strapi"
echo "  重启服务: docker-compose -f docker-compose.simple.yml restart"
echo "  进入容器: docker exec -it strapi-backend sh"
echo ""
echo "🔄 注意：开发模式下，代码更改会自动重载" 