# 使用官方Node.js镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 确保.tmp目录存在并复制开发数据
RUN mkdir -p .tmp

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 1337

# 启动应用
CMD ["npm", "start"] 