## ADDED Requirements

### Requirement: PayPal 配置持久化存储
系统 SHALL 在数据库中维护一张 `paypal_config` 表，存储 Client ID、加密后的 Client Secret、环境模式（`sandbox` / `live`）、是否启用信用卡表单标志、以及记录的创建与更新时间。Client Secret SHALL 使用 AES-256-GCM 加密，加密密钥来自环境变量 `PAYPAL_CONFIG_ENCRYPTION_KEY`。

#### Scenario: 配置首次写入
- **WHEN** 管理员首次在 admin 填写 Client ID、Client Secret 并选择环境模式后保存
- **THEN** 系统在 `paypal_config` 表中插入一条记录，Client Secret 以密文形式存储，返回 HTTP 200

#### Scenario: 配置更新
- **WHEN** 管理员修改已有配置（如切换 mode 或更新密钥）并保存
- **THEN** 系统更新现有记录，Client Secret 重新加密，无需重启进程即刻生效

#### Scenario: 加密密钥缺失
- **WHEN** 环境变量 `PAYPAL_CONFIG_ENCRYPTION_KEY` 未设置
- **THEN** Medusa 启动时日志输出警告，所有 PayPal API 调用返回配置错误，不中断其他支付提供商

---

### Requirement: PayPal 连通性测试
系统 SHALL 提供 `POST /admin/paypal/test-connection` 接口，使用当前数据库中的 Client ID 和 Client Secret 向 PayPal OAuth 端点获取 Access Token，并返回测试结果。

#### Scenario: 测试成功
- **WHEN** 管理员点击"测试连接"且当前配置的密钥有效
- **THEN** 接口返回 `{ "success": true, "environment": "sandbox" | "live" }`，HTTP 200

#### Scenario: 测试失败
- **WHEN** 管理员点击"测试连接"且密钥无效或网络不通
- **THEN** 接口返回 `{ "success": false, "error": "<描述>" }`，HTTP 200（非 5xx），admin 界面展示错误信息

---

### Requirement: Admin 全局设置 PayPal 配置页面
Admin 前端 SHALL 在全局设置（Settings）中新增"支付 → PayPal"配置区块，包含：Client ID 输入框、Client Secret 密码输入框（可掩码切换显示）、环境模式下拉（沙盒 / 正式）、信用卡表单开关、测试连接按钮、保存按钮。

#### Scenario: 正式环境高亮警示
- **WHEN** 当前保存的 mode 为 `live`
- **THEN** admin 页面以橙色/红色警示色显示"当前为正式环境"提示横幅

#### Scenario: 配置读取回显
- **WHEN** 管理员进入 PayPal 配置页面
- **THEN** Client ID 正常回显，Client Secret 字段显示掩码（不返回明文），mode 和开关状态正确回显

