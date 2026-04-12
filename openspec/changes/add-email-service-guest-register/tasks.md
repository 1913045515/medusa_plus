## 1. 依赖安装与模块初始化

- [x] 1.1 在 `my-store/` 中安装 nodemailer：`npm install nodemailer` 及类型 `npm install -D @types/nodemailer`
- [x] 1.2 创建 `my-store/src/modules/email-proxy/` 目录结构：`index.ts`、`service.ts`、`types.ts`
- [x] 1.3 在 `my-store/medusa-config.ts` 中注册 `email-proxy` 模块

## 2. 后端：邮件代理模块核心实现

- [x] 2.1 在 `my-store/src/modules/email-proxy/types.ts` 中定义 SMTP 配置接口（SmtpConfig: host, port, user, pass, fromName）
- [x] 2.2 在 `my-store/src/modules/email-proxy/service.ts` 中实现 `EmailProxyService`：
  - `sendMail(config, to, subject, html)`: 使用 nodemailer createTransport 发送邮件，配置不完整时 warn 跳过
  - `testConnection(config)`: 发送测试邮件到配置的发件地址
- [x] 2.3 在 `my-store/src/modules/email-proxy/index.ts` 导出模块

## 3. 后端：邮件代理配置 API

- [x] 3.1 创建 `my-store/src/api/admin/store-settings/email-proxy/route.ts`，实现 GET 端点（返回配置，pass 字段遮盖为 `"***"`）
- [x] 3.2 在同文件实现 PUT 端点（保存 SMTP 配置到 store-settings key: `email_proxy_config`）
- [x] 3.3 创建 `my-store/src/api/admin/store-settings/email-proxy/test/route.ts`，实现 POST 端点（调用 `EmailProxyService.testConnection()`）

## 4. Admin 扩展：邮件代理配置页面

- [x] 4.1 在 `my-store/src/admin/` 下创建邮件代理配置页面组件（`email-proxy/page.tsx`），包含 SMTP 表单（host、port、user、pass、fromName 字段）
- [x] 4.2 添加"发送测试邮件"按钮，调用 POST test 端点，显示成功/失败 toast
- [x] 4.3 在 Admin 路由中注册邮件代理配置页，归入商店设置分组

## 5. 后端：游客自动注册 Subscriber

- [x] 5.1 创建 `my-store/src/subscribers/order-placed.ts`，订阅 `order.placed` 事件
- [x] 5.2 在 subscriber 中实现查询逻辑：通过订单邮箱查询是否已有 customer（调用 Medusa Customer 模块 API）
- [x] 5.3 实现随机密码生成函数（`crypto.randomBytes`，10位，大小写字母+数字）
- [x] 5.4 若邮箱无 customer：调用 Medusa Auth 模块创建 customer 账号，设置随机密码
- [x] 5.5 注册成功后调用 `EmailProxyService.sendMail()` 发送包含临时密码的欢迎邮件（HTML 模板内联写在 subscriber 文件中）
- [x] 5.6 用 try/catch 包裹全部注册逻辑，捕获异常记录 `console.error`，保证不影响主流程

## 6. 欢迎邮件内容

- [x] 6.1 在 subscriber 中定义邮件 HTML 模板，内容包含：登录邮箱、临时密码、店铺链接、建议修改密码提示（中英文双语）

## 7. 验证与测试

- [ ] 7.1 在 Admin 中填写 QQ SMTP 配置，点击"发送测试邮件"验证连通性
- [ ] 7.2 用未注册邮箱完成游客下单，确认邮箱收到欢迎邮件且密码可登录
- [ ] 7.3 用已注册邮箱完成游客下单，确认无重复邮件发送
- [ ] 7.4 断开 SMTP（错误配置）后完成下单，确认订单正常，日志有警告输出
