#!/bin/bash

# CentOS 服务器环境配置脚本
echo "开始配置 CentOS 服务器环境..."

# 更新系统
sudo yum update -y

# 安装 Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证 Node.js 和 npm 版本
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# 安装 PM2 进程管理器
sudo npm install -g pm2

# 安装 Git
sudo yum install -y git

# 安装 Nginx
sudo yum install -y epel-release
sudo yum install -y nginx

# 启动并设置 Nginx 开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 创建应用目录
sudo mkdir -p /var/www/strapi-backend
sudo chown -R $USER:$USER /var/www/strapi-backend

# 安装 PostgreSQL（推荐用于生产环境）
sudo yum install -y postgresql postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "服务器环境配置完成！"
echo "请运行以下命令设置 PostgreSQL："
echo "sudo su - postgres"
echo "psql"
echo "CREATE USER strapi WITH PASSWORD 'your_password';"
echo "CREATE DATABASE strapi OWNER strapi;"
echo "\\q"
echo "exit" 