# Strapi Backend Docker 简化启动脚本
Write-Host "使用 .env 配置启动 Strapi Backend..." -ForegroundColor Green

# 检查.env文件是否存在
if (-not (Test-Path ".env")) {
    Write-Host "错误：未找到 .env 文件" -ForegroundColor Red
    Write-Host "请确保 .env 文件存在，包含所有必要的环境变量" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ 发现 .env 文件" -ForegroundColor Green

# 检查Docker是否可用
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        Write-Host "错误：Docker 未安装或未启动" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Docker 可用: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "错误：无法连接到Docker" -ForegroundColor Red
    exit 1
}

# 读取.env文件中的端口配置
$port = "1337"  # 默认端口
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
foreach ($line in $envContent) {
    if ($line -match "^PORT=(.+)$") {
        $port = $Matches[1].Trim()
        break
    }
}

Write-Host "✓ 使用端口: $port" -ForegroundColor Green

# 检查数据库文件是否存在
if (Test-Path ".tmp/data.db") {
    Write-Host "✓ 发现开发环境数据库文件" -ForegroundColor Green
} else {
    Write-Host "! 未发现开发环境数据库文件，将创建新数据库" -ForegroundColor Yellow
    # 确保.tmp目录存在
    if (-not (Test-Path ".tmp")) {
        New-Item -ItemType Directory -Path ".tmp" -Force
        Write-Host "✓ 创建 .tmp 目录" -ForegroundColor Green
    }
}

# 启动服务
Write-Host "启动容器..." -ForegroundColor Yellow
docker compose -f docker-compose.simple.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "容器启动成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问地址：" -ForegroundColor Cyan
    Write-Host "- Admin Panel: http://localhost:$port/admin" -ForegroundColor White
    Write-Host "- API: http://localhost:$port/api" -ForegroundColor White
    Write-Host "- Translate API: http://localhost:$port/api/translate/locales" -ForegroundColor White
    Write-Host ""
    Write-Host "数据共享：" -ForegroundColor Cyan
    Write-Host "- 数据库：.tmp/data.db（与开发环境共享）" -ForegroundColor White
    Write-Host "- 上传文件：public/uploads/（与开发环境共享）" -ForegroundColor White
    Write-Host "- 环境变量：从 .env 文件加载" -ForegroundColor White
    Write-Host ""
    Write-Host "常用命令：" -ForegroundColor Yellow
    Write-Host "- 查看日志：docker compose -f docker-compose.simple.yml logs -f" -ForegroundColor White
    Write-Host "- 停止服务：docker compose -f docker-compose.simple.yml down" -ForegroundColor White
    Write-Host "- 重启服务：docker compose -f docker-compose.simple.yml restart" -ForegroundColor White
} else {
    Write-Host "容器启动失败！" -ForegroundColor Red
    Write-Host "请检查 .env 文件配置和Docker状态" -ForegroundColor Yellow
    Write-Host "您可以手动运行：docker compose -f docker-compose.simple.yml up" -ForegroundColor White
    exit 1
} 