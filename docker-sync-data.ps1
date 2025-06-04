# Strapi 数据同步脚本
param(
    [string]$Direction = "to-container"  # to-container 或 from-container
)

Write-Host "Strapi 数据同步工具" -ForegroundColor Green

# 检查容器是否运行
$containerRunning = docker ps -q -f name=strapi-backend
if (-not $containerRunning) {
    Write-Host "错误：strapi-backend 容器未运行" -ForegroundColor Red
    Write-Host "请先使用 './docker-start.ps1' 启动容器" -ForegroundColor Yellow
    exit 1
}

switch ($Direction) {
    "to-container" {
        Write-Host "正在将主机数据同步到容器..." -ForegroundColor Yellow
        
        # 同步数据库
        if (Test-Path ".tmp/data.db") {
            docker cp ".tmp/data.db" strapi-backend:/app/.tmp/data.db
            Write-Host "✓ 数据库文件已同步到容器" -ForegroundColor Green
        } else {
            Write-Host "! 主机上未找到数据库文件" -ForegroundColor Yellow
        }
        
        # 同步上传文件
        if (Test-Path "public/uploads") {
            docker cp "public/uploads/." strapi-backend:/app/public/uploads/
            Write-Host "✓ 上传文件已同步到容器" -ForegroundColor Green
        }
    }
    
    "from-container" {
        Write-Host "正在将容器数据同步到主机..." -ForegroundColor Yellow
        
        # 确保目录存在
        if (-not (Test-Path ".tmp")) { New-Item -ItemType Directory -Path ".tmp" }
        if (-not (Test-Path "public/uploads")) { New-Item -ItemType Directory -Path "public/uploads" }
        
        # 同步数据库
        docker cp strapi-backend:/app/.tmp/data.db ".tmp/data.db"
        Write-Host "✓ 数据库文件已同步到主机" -ForegroundColor Green
        
        # 同步上传文件
        docker cp strapi-backend:/app/public/uploads/. "public/uploads/"
        Write-Host "✓ 上传文件已同步到主机" -ForegroundColor Green
    }
    
    default {
        Write-Host "错误：无效的方向参数" -ForegroundColor Red
        Write-Host "使用方法：" -ForegroundColor Yellow
        Write-Host "  ./docker-sync-data.ps1 to-container    # 将主机数据同步到容器" -ForegroundColor White
        Write-Host "  ./docker-sync-data.ps1 from-container  # 将容器数据同步到主机" -ForegroundColor White
        exit 1
    }
}

Write-Host "数据同步完成！" -ForegroundColor Green 