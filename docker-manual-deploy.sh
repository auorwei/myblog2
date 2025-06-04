#!/bin/bash

echo "=== Strapi 手动开发环境 Docker部署脚本 ==="

# 确保在正确的目录
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ 请在包含docker-compose.dev.yml的目录中运行此脚本"
    exit 1
fi

# 停止现有容器
echo "🛑 停止现有容器..."
docker-compose -f docker-compose.dev.yml down

# 检查数据库文件
echo "📊 检查数据库文件..."
if [ -f ".tmp/data.db" ]; then
    echo "✅ 本地数据库文件存在: .tmp/data.db"
    ls -lh .tmp/data.db
    echo "📊 数据库文件大小: $(du -sh .tmp/data.db | cut -f1)"
else
    echo "❌ 数据库文件不存在"
    mkdir -p .tmp
fi

# 确保目录存在
mkdir -p public/uploads
chmod 755 .tmp public/uploads

# 启动容器（不启动strapi）
echo "🚀 启动Docker容器（待机模式）..."
docker-compose -f docker-compose.dev.yml up -d

# 等待容器启动
echo "⏳ 等待容器启动..."
sleep 5

# 在容器中执行npm install
echo "📦 在容器中执行 npm install..."
docker exec strapi-backend-dev npm install

# 在容器中执行npm run build
echo "🔨 在容器中执行 npm run build..."
docker exec strapi-backend-dev npm run build

# 检查数据库文件是否在容器中
echo "💽 检查容器中的数据库文件..."
docker exec strapi-backend-dev ls -la /opt/app/.tmp/

# 现在启动strapi
echo "🚀 启动 Strapi 开发服务器..."
docker exec -d strapi-backend-dev npm run develop

# 等待服务启动
echo "⏳ 等待Strapi服务启动..."
sleep 10

# 显示日志
echo "📄 显示服务日志..."
docker exec strapi-backend-dev ps aux | grep node

echo ""
echo "✅ 手动部署完成！"
echo "📱 访问地址：http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):1337"
echo "🔧 管理后台：http://$(hostname -I | awk '{print $1}' 2>/dev/null || echo 'localhost'):1337/admin"
echo ""
echo "🔧 手动操作命令："
echo "  进入容器: docker exec -it strapi-backend-dev sh"
echo "  查看进程: docker exec strapi-backend-dev ps aux"
echo "  重启Strapi: docker exec strapi-backend-dev pkill node && docker exec -d strapi-backend-dev npm run develop"
echo "  查看日志: docker exec strapi-backend-dev tail -f ~/.npm/_logs/*.log"
echo ""
echo "💡 如果需要重新安装依赖或重新构建："
echo "  docker exec strapi-backend-dev npm install"
echo "  docker exec strapi-backend-dev npm run build" 