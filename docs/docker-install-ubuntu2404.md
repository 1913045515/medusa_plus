# Ubuntu Server 24.04 LTS 安装 Docker Compose

## 1. 更新系统包

```bash
sudo apt update && sudo apt upgrade -y
```

## 2. 安装依赖

```bash
sudo apt install -y ca-certificates curl gnupg
```

## 3. 添加 Docker 官方 GPG 密钥

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

## 4. 添加 Docker APT 源

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

## 5. 安装 Docker Engine + Compose 插件

```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 6. 验证安装

```bash
docker --version
docker compose version
```

## 7.（可选）让当前用户免 sudo 使用 Docker

```bash
sudo usermod -aG docker $USER
newgrp docker
```

注销并重新登录后生效。

## 说明

- Ubuntu 24.04 使用 `docker compose`（V2 插件形式，无连字符），已取代旧的 `docker-compose`（V1 独立二进制）。
- 项目中的 `docker-compose.dev.yml` 等文件可直接通过 `docker compose -f docker-compose.dev.yml up` 使用。
