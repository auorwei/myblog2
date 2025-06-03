# 一键部署脚本 - 配置好服务器信息后可直接运行
param(
    [switch]$FirstTime
)

# 服务器配置 - 请根据你的服务器信息修改
$SERVER_IP = "YOUR_SERVER_IP"          # 你的服务器 IP
$SERVER_USER = "YOUR_USERNAME"         # 服务器用户名
$SERVER_PATH = "/var/www/strapi-backend"

# 验证配置
if ($SERVER_IP -eq "YOUR_SERVER_IP" -or $SERVER_USER -eq "YOUR_USERNAME") {
    Write-Host "❌ 请先配置服务器信息！" -ForegroundColor Red
    Write-Host "编辑文件 deploy/quick-deploy.ps1，修改 SERVER_IP 和 SERVER_USER" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Strapi 一键部署脚本" -ForegroundColor Green
Write-Host "📡 目标服务器: $SERVER_IP" -ForegroundColor Cyan
Write-Host "👤 用户: $SERVER_USER" -ForegroundColor Cyan

# 首次部署需要额外步骤
if ($FirstTime) {
    Write-Host "🔧 首次部署，创建服务器目录和环境配置..." -ForegroundColor Yellow
    
    # 创建服务器目录
    ssh ${SERVER_USER}@${SERVER_IP} "sudo mkdir -p $SERVER_PATH && sudo chown ${SERVER_USER}:${SERVER_USER} $SERVER_PATH"
    
    Write-Host "⚠️  请在服务器上完成以下步骤：" -ForegroundColor Yellow
    Write-Host "1. 复制 deploy/env.production.example 为 .env.production" -ForegroundColor White
    Write-Host "2. 修改 .env.production 中的配置（数据库密码、密钥等）" -ForegroundColor White
    Write-Host "3. 确保 Docker 和 Docker Compose 已安装" -ForegroundColor White
    
    Read-Host "完成后按回车继续..."
}

# 执行同步和部署
Write-Host "📤 开始同步和部署..." -ForegroundColor Blue

try {
    & "./deploy/sync-to-server.ps1" -ServerIP $SERVER_IP -ServerUser $SERVER_USER -Deploy
    
    Write-Host "🎉 部署成功！" -ForegroundColor Green
    Write-Host "🌐 Strapi 地址: http://${SERVER_IP}:1337" -ForegroundColor Cyan
    Write-Host "🔧 管理面板: http://${SERVER_IP}:1337/admin" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ 部署失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "✨ 完成！" -ForegroundColor Green 