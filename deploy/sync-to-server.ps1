# Strapi 项目同步到服务器脚本 (PowerShell)
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerUser,
    
    [string]$ServerPath = "/var/www/strapi-backend",
    
    [switch]$Deploy
)

# 检查必要工具
if (-not (Get-Command "rsync" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到 rsync 工具，请先安装 WSL 或 Git Bash" -ForegroundColor Red
    Write-Host "💡 或者使用 scp 替代方案" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 开始同步 Strapi 项目到服务器..." -ForegroundColor Green

# 排除文件列表
$excludeFile = "deploy/rsync-exclude.txt"

# 同步文件到服务器
Write-Host "📤 同步文件到服务器 $ServerIP..." -ForegroundColor Blue

try {
    # 使用 rsync 同步（需要 WSL 或 Git Bash）
    rsync -avz --delete --exclude-from=$excludeFile ./ ${ServerUser}@${ServerIP}:${ServerPath}/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 文件同步成功！" -ForegroundColor Green
    } else {
        throw "rsync 同步失败"
    }
} catch {
    Write-Host "⚠️  rsync 失败，尝试使用 scp..." -ForegroundColor Yellow
    
    # 备用：使用 scp（较慢但更兼容）
    scp -r ./* ${ServerUser}@${ServerIP}:${ServerPath}/
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 文件同步成功（scp）！" -ForegroundColor Green
    } else {
        Write-Host "❌ 文件同步失败" -ForegroundColor Red
        exit 1
    }
}

# 如果指定了 -Deploy 参数，执行部署
if ($Deploy) {
    Write-Host "🔄 执行远程部署..." -ForegroundColor Blue
    
    # 远程执行部署脚本
    ssh ${ServerUser}@${ServerIP} "cd $ServerPath && chmod +x deploy/deploy.sh && ./deploy/deploy.sh"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 部署完成！" -ForegroundColor Green
        Write-Host "🌐 访问地址: http://${ServerIP}:1337" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 部署失败，请检查服务器日志" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✨ 同步操作完成！" -ForegroundColor Green 