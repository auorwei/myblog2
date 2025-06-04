#!/bin/bash

echo "=== Strapi Docker部署前检查 ==="

# 检查数据库文件
if [ -f ".tmp/data.db" ]; then
    echo "✅ 数据库文件存在: .tmp/data.db"
    ls -lh .tmp/data.db
else
    echo "❌ 数据库文件不存在: .tmp/data.db"
    echo "请确保从git仓库正确克隆了包含数据的项目"
    exit 1
fi

# 检查上传目录
if [ -d "public/uploads" ]; then
    echo "✅ 上传目录存在: public/uploads"
else
    echo "⚠️  创建上传目录: public/uploads"
    mkdir -p public/uploads
fi

# 检查Docker Compose文件
if [ -f "docker-compose.simple.yml" ]; then
    echo "✅ Docker Compose文件存在"
else
    echo "❌ Docker Compose文件不存在"
    exit 1
fi

echo ""
echo "=== 开始Docker部署 ==="
docker-compose -f docker-compose.simple.yml up -d --build

echo ""
echo "=== 检查容器状态 ==="
docker ps | grep strapi-backend

echo ""
echo "=== 检查数据挂载 ==="
docker exec strapi-backend ls -la /opt/app/.tmp/

echo ""
echo "部署完成！"
echo "访问地址：http://$(hostname -I | awk '{print $1}'):1337" 