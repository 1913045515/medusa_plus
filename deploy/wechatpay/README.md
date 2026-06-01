# 微信支付 APIv3 证书目录

此目录的所有 PEM 文件会被 `docker-compose.yml` 以只读方式挂载到
容器内 `/app/wechatpay`，由后端通过环境变量按路径加载，**绝不会写入
镜像 / Git 仓库**。

请放置如下文件：

| 文件名 | 必需 | 说明 |
| --- | --- | --- |
| `apiclient_cert.pem` | 否（仅用于读取序列号） | 商户 API 证书。**已由用户提供**，可用 `openssl x509 -in apiclient_cert.pem -noout -serial` 获取 `WECHATPAY_MERCHANT_CERT_SERIAL_NO`（去掉 `serial=` 前缀，转大写）。 |
| `apiclient_key.pem` | **是** | 商户 API 私钥。请从「微信支付商户平台 → 账户中心 → API 安全 → API 证书」下载工具包后获取。运行时绝不能放到镜像里。 |
| `wechatpay_public_key.pem` | **是** | 微信支付平台公钥（APIv3 新版）。商户平台 → 账户中心 → API 安全 → 微信支付公钥，下载得到，公钥 ID 已配置为 `PUB_KEY_ID_0117463376432026053100212235001400`。 |

## 获取证书序列号

```bash
openssl x509 -in apiclient_cert.pem -noout -serial
# serial=47:8A:50:96:74:9B:7B:2A:AA:9C:D7:A5:AE:65:EF:6B:35:E0:28:22
```

把冒号去掉、字母转大写后填到 `WECHATPAY_MERCHANT_CERT_SERIAL_NO`：
```
478A5096749B7B2AAA9CD7A5AE65EF6B35E02822
```

## 验证 APIv3 密钥长度

```bash
echo -n "$WECHATPAY_API_V3_KEY" | wc -c   # 必须输出 32
```

## .gitignore

该目录除 `apiclient_cert.pem` 与本 README 外，**所有 `*.pem` 私钥已加入 `.gitignore`**，不要提交。
