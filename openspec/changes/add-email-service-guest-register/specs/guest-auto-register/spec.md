## ADDED Requirements

### Requirement: Guest order triggers automatic account registration
系统 SHALL 在 `order.placed` 事件触发后，检查下单邮箱是否已有 customer 账号。

- 若邮箱无对应 customer：创建账号（email + 随机10位密码），通过邮件发送临时密码
- 若邮箱已有 customer：跳过注册，不发送任何邮件
- 注册逻辑 SHALL 异步执行，不阻断订单创建

#### Scenario: New guest email triggers registration
- **WHEN** `order.placed` 事件触发，且订单邮箱在系统中无对应 customer
- **THEN** 系统 SHALL 创建 customer 账号，生成10位随机密码，并发送包含临时密码的欢迎邮件到该邮箱

#### Scenario: Existing customer email skips registration
- **WHEN** `order.placed` 事件触发，且订单邮箱已对应有 customer 账号
- **THEN** 系统 SHALL NOT 创建新账号，SHALL NOT 发送邮件

#### Scenario: Registration failure does not affect order
- **WHEN** 账号创建或邮件发送过程中出现异常
- **THEN** 异常 SHALL 被捕获并记录日志，订单数据 SHALL NOT 受影响

### Requirement: Random password generation is secure
系统生成的临时密码 SHALL 使用 `crypto.randomBytes` 生成，长度不少于 10 位，包含大小写字母和数字。

#### Scenario: Password meets complexity requirements
- **WHEN** 系统生成临时密码
- **THEN** 密码 SHALL 长度为 10 位，包含至少1位大写字母、1位小写字母、1位数字

### Requirement: Welcome email contains login credentials
发送给新注册游客的欢迎邮件 SHALL 包含：
- 下单邮箱（即登录账号）
- 临时密码
- 提示用户登录后修改密码

#### Scenario: Welcome email sent to correct address
- **WHEN** 游客注册成功
- **THEN** 系统 SHALL 向订单邮箱发送欢迎邮件，邮件包含登录邮箱和临时密码

#### Scenario: Email sending uses configured SMTP
- **WHEN** 发送欢迎邮件时
- **THEN** 系统 SHALL 使用 Admin 中配置的 QQ SMTP 参数发送，若配置缺失则记录警告跳过发送
