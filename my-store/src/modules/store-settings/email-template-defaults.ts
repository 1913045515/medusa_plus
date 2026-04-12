export type EmailTemplate = {
  subject: string
  html: string
}

export type EmailTemplatesConfig = {
  guest_register: EmailTemplate
  order_placed: EmailTemplate
}

/**
 * guest_register 模板可用变量：
 *   {{email}}        - 登录邮箱
 *   {{password}}     - 临时密码
 *   {{store_url}}    - 商店网址
 *
 * order_placed 模板可用变量：
 *   {{email}}            - 客户邮箱
 *   {{order_id}}         - 订单编号
 *   {{order_items_html}} - 订单商品 HTML 表格
 *   {{order_total}}      - 订单总金额
 *   {{currency}}         - 货币代码
 *   {{store_url}}        - 商店网址
 *   {{password_section}} - 新账号密码区块（已有账号时为空字符串）
 */
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplatesConfig = {
  guest_register: {
    subject: "您的账号已创建 / Your Account Has Been Created",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; }
    h2 { color: #1a1a1a; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .box p { margin: 8px 0; font-size: 15px; }
    .password { font-size: 22px; letter-spacing: 3px; font-weight: bold; color: #4f46e5; }
    .btn { display: inline-block; background: #4f46e5; color: #fff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .tip { color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🎉 欢迎加入 / Welcome!</h2>
    <p>您好！我们已为您自动创建账号，可以使用以下信息登录：</p>
    <p>Hello! We've automatically created an account for you:</p>
    <div class="box">
      <p>📧 <strong>邮箱 / Email:</strong> {{email}}</p>
      <p>🔑 <strong>临时密码 / Temporary Password:</strong> <span class="password">{{password}}</span></p>
    </div>
    <p>请登录后尽快修改密码以保护账号安全。</p>
    <p>Please log in and change your password to secure your account.</p>
    <a class="btn" href="{{store_url}}/account">登录账号 / Login</a>
    <div class="tip">
      如果您没有在本站下单，请忽略此邮件。<br>
      If you did not place an order on our site, please ignore this email.
    </div>
  </div>
</body>
</html>`,
  },
  order_placed: {
    subject: "订单确认 #{{order_id}} / Order Confirmation #{{order_id}}",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; }
    h2 { color: #1a1a1a; }
    .order-id { color: #4f46e5; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-size: 13px; color: #6b7280; }
    td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .total-row td { font-weight: bold; border-top: 2px solid #e5e7eb; }
    .box { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .box p { margin: 8px 0; font-size: 15px; }
    .password { font-size: 22px; letter-spacing: 3px; font-weight: bold; color: #4f46e5; }
    .btn { display: inline-block; background: #4f46e5; color: #fff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .tip { color: #6b7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>✅ 订单已确认 / Order Confirmed</h2>
    <p>感谢您的购买！您的订单号为：<span class="order-id">#{{order_id}}</span></p>
    <p>Thank you for your purchase! Your order number is: <span class="order-id">#{{order_id}}</span></p>

    {{order_items_html}}

    <p style="text-align:right; font-weight:bold; font-size:16px;">
      合计 / Total：{{order_total}} {{currency}}
    </p>

    {{password_section}}

    <a class="btn" href="{{store_url}}/account/orders">查看订单 / View Orders</a>

    <div class="tip">
      如有疑问请联系我们的客服。<br>
      If you have any questions, please contact our support team.
    </div>
  </div>
</body>
</html>`,
  },
}

export const TEMPLATE_VARIABLE_DOCS = {
  guest_register: [
    { name: "{{email}}", desc: "登录邮箱" },
    { name: "{{password}}", desc: "临时密码" },
    { name: "{{store_url}}", desc: "商店网址" },
  ],
  order_placed: [
    { name: "{{order_id}}", desc: "订单编号" },
    { name: "{{email}}", desc: "客户邮箱" },
    { name: "{{order_items_html}}", desc: "订单商品列表（HTML 表格）" },
    { name: "{{order_total}}", desc: "订单总金额" },
    { name: "{{currency}}", desc: "货币代码（如 USD）" },
    { name: "{{store_url}}", desc: "商店网址" },
    { name: "{{password_section}}", desc: "新账号密码区块（已有账号时为空）" },
  ],
}
