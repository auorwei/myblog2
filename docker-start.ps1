# Strapi Backend Docker 启动脚本
Write-Host "启动 Strapi Backend（包含开发环境数据）..." -ForegroundColor Green

# 检查Docker是否运行
$dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "Docker Desktop 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 检查数据库文件是否存在
if (Test-Path ".tmp/data.db") {
    Write-Host "发现开发环境数据库文件，将在容器中使用" -ForegroundColor Cyan
} else {
    Write-Host "警告：未发现开发环境数据库文件，将创建新的数据库" -ForegroundColor Yellow
}

# 启动服务
Write-Host "启动 Docker 容器..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "容器启动成功！" -ForegroundColor Green
    Write-Host "访问地址：" -ForegroundColor Cyan
    Write-Host "- Admin Panel: http://localhost:1337/admin" -ForegroundColor White
    Write-Host "- API: http://localhost:1337/api" -ForegroundColor White
    Write-Host "- Translate API: http://localhost:1337/api/translate/locales" -ForegroundColor White
    Write-Host "" 
    Write-Host "数据同步说明：" -ForegroundColor Cyan
    Write-Host "- 容器中的数据变更会同步到主机" -ForegroundColor White
    Write-Host "- 主机中的数据变更会同步到容器" -ForegroundColor White
    Write-Host "" 
    Write-Host "常用命令：" -ForegroundColor Yellow
    Write-Host "- 查看日志：docker-compose logs -f" -ForegroundColor White
    Write-Host "- 停止服务：docker-compose down" -ForegroundColor White
    Write-Host "- 重新构建：docker-compose up --build -d" -ForegroundColor White
} else {
    Write-Host "容器启动失败！" -ForegroundColor Red
    exit 1
} 