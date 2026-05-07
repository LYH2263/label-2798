FROM node:20-alpine

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --only=production

COPY . .

RUN mkdir -p logs

EXPOSE 3001

CMD ["node", "src/app.js"]