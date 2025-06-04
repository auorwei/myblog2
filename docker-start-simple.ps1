# Strapi Backend Docker 简化启动脚本
Write-Host "使用简化配置启动 Strapi Backend..." -ForegroundColor Green

# 检查.env文件是否存在
if (-not (Test-Path ".env")) {
    Write-Host "错误：未找到.env文件" -ForegroundColor Red
    Write-Host "请确保.env文件存在，或从.env.example复制一份" -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        $response = Read-Host "是否要从.env.example创建.env文件？(y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            Copy-Item ".env.example" ".env"
            Write-Host "已创建.env文件，请编辑后重新运行" -ForegroundColor Yellow
        }
    }
    exit 1
}

# 检查Docker是否运行
$dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "Docker Desktop 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 读取.env文件中的端口配置
$envContent = Get-Content ".env" -ErrorAction SilentlyContinue
$port = "1337"  # 默认端口
foreach ($line in $envContent) {
    if ($line -match "^PORT=(.+)$") {
        $port = $Matches[1]
        break
    }
}

# 检查数据库文件是否存在
if (Test-Path ".tmp/data.db") {
    Write-Host "✓ 发现开发环境数据库文件" -ForegroundColor Green
} else {
    Write-Host "! 未发现开发环境数据库文件，将创建新数据库" -ForegroundColor Yellow
}

# 启动服务
Write-Host "使用端口 $port 启动容器..." -ForegroundColor Yellow
docker-compose -f docker-compose-simple.yml up -d

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
    Write-Host ""
    Write-Host "常用命令：" -ForegroundColor Yellow
    Write-Host "- 查看日志：docker-compose -f docker-compose-simple.yml logs -f" -ForegroundColor White
    Write-Host "- 停止服务：docker-compose -f docker-compose-simple.yml down" -ForegroundColor White
    Write-Host "- 重启服务：docker-compose -f docker-compose-simple.yml restart" -ForegroundColor White
} else {
    Write-Host "容器启动失败！" -ForegroundColor Red
    Write-Host "请检查.env文件配置或Docker状态" -ForegroundColor Yellow
    exit 1
} 