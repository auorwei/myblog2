# Strapi Backend Docker 构建脚本
Write-Host "开始构建 Strapi Backend Docker 镜像..." -ForegroundColor Green

# 检查Docker是否运行
$dockerRunning = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerRunning) {
    Write-Host "Docker Desktop 未运行，请先启动 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 构建镜像
Write-Host "构建 Docker 镜像..." -ForegroundColor Yellow
docker build -t strapi-backend .

if ($LASTEXITCODE -eq 0) {
    Write-Host "镜像构建成功！" -ForegroundColor Green
    Write-Host "使用以下命令启动容器：" -ForegroundColor Cyan
    Write-Host "docker-compose up -d" -ForegroundColor White
} else {
    Write-Host "镜像构建失败！" -ForegroundColor Red
    exit 1
} 