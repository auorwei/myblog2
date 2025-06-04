#!/bin/bash

echo "=== Strapi Docker 交互式环境 ==="

# 检查docker-compose文件
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ docker-compose.dev.yml 文件不存在"
    exit 1
fi

echo "🚀 启动Docker容器..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ 等待容器启动..."
sleep 3

echo ""
echo "✅ 容器已启动！现在您可以手动执行以下命令："
echo ""
echo "🔧 进入容器："
echo "   docker exec -it strapi-backend-dev sh"
echo ""
echo "📦 在容器中执行的步骤："
echo "   1. npm install"
echo "   2. npm run build"
echo "   3. npm run develop"
echo ""
echo "🔄 快速执行所有步骤："
echo "   docker exec -it strapi-backend-dev sh -c 'npm install && npm run build && npm run develop'"
echo ""

# 提供选择
echo "您想要："
echo "1) 自动执行所有步骤"
echo "2) 手动进入容器"
echo "3) 查看当前状态"
echo "4) 停止容器"
echo ""
read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "🚀 自动执行所有步骤..."
        docker exec strapi-backend-dev npm install
        docker exec strapi-backend-dev npm run build
        echo "🔥 启动开发服务器..."
        docker exec -it strapi-backend-dev npm run develop
        ;;
    2)
        echo "🔧 进入容器交互模式..."
        echo "💡 提示：在容器中依次执行 npm install, npm run build, npm run develop"
        docker exec -it strapi-backend-dev sh
        ;;
    3)
        echo "📊 当前状态："
        docker ps | grep strapi-backend-dev
        docker exec strapi-backend-dev ls -la /opt/app/.tmp/
        ;;
    4)
        echo "🛑 停止容器..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    *)
        echo "❌ 无效选择"
        ;;
esac 