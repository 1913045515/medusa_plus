## ADDED Requirements

### Requirement: 虚拟产品资料类型关联文件选择器
当虚拟产品类型为 `resource` 时，admin 商品编辑表单 SHALL 展示文件选择器，允许管理员从文件管理模块中选择一个已上传的文件，系统 SHALL 将选中文件的 `file_asset_id` 以 `resource_file_asset_id` 字段持久化到商品 metadata 中。

#### Scenario: 管理员选择文件资产
- **WHEN** admin 用户在商品配置中将虚拟类型设为 `resource` 并从文件选择器中选择一个文件
- **THEN** 系统将 `resource_file_asset_id` 写入商品 metadata，商品配置表单显示所选文件的名称和大小

#### Scenario: 文件选择器搜索
- **WHEN** admin 用户在文件选择器弹窗中输入关键词
- **THEN** 弹窗仅展示名称匹配的文件，支持按上传时间排序

#### Scenario: 资料类型未选择文件时不允许保存
- **WHEN** admin 用户将虚拟类型设为 `resource` 但未选择文件资产
- **THEN** 商品保存操作被拒绝，提示"请为数字资料商品选择对应的文件"，HTTP 400

---

### Requirement: 已配置外部 URL 商品的降级展示
若商品 metadata 中存在旧的 `resource_download_url` 字段但尚未迁移到 `resource_file_asset_id`，admin 商品编辑表单 SHALL 在文件选择器旁展示"待迁移"标识，并可清除旧字段；storefront 订单详情 SHALL 展示"下载配置待管理员更新"提示，不展示下载按钮。

#### Scenario: 旧字段降级展示
- **WHEN** admin 用户查看含 `resource_download_url` 但缺少 `resource_file_asset_id` 的资料类商品
- **THEN** 文件选择器展示"此商品使用旧版外部 URL，已停用，请重新选择文件"警告，并清空旧字段选项

#### Scenario: Storefront 旧配置降级
- **WHEN** 顾客在订单详情中查看旧版外部 URL 配置的资料商品
- **THEN** 系统展示"下载配置待管理员更新，请联系客服"，不展示下载链接
