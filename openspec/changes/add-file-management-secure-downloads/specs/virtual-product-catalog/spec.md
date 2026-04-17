## MODIFIED Requirements

### Requirement: 虚拟产品资料配置使用文件资产关联
当 `virtual_product_type` 为 `resource` 时，商品配置 SHALL 使用 `resource_file_asset_id` 字段关联文件管理模块中的文件记录，代替之前的 `resource_download_url` 外部 URL 字段。系统 SHALL 在保存时验证 `resource_file_asset_id` 指向的 `file_asset` 记录存在，否则返回 HTTP 400。

旧字段 `resource_download_url` SHALL 在数据库中保留（不删除）以兼容历史数据，但不支持新写入：若请求体中包含 `resource_download_url` 但不含 `resource_file_asset_id`，系统 SHALL 返回 HTTP 400，错误提示管理员通过文件管理模块上传后选择文件。

#### Scenario: 资料类商品保存时关联有效文件资产
- **WHEN** admin 用户将 `virtual_product_type` 设为 `resource` 并提供有效的 `resource_file_asset_id`
- **THEN** 系统验证该 `file_asset` 记录存在，写入商品 metadata，返回 HTTP 200

#### Scenario: 资料类商品保存时缺少文件关联
- **WHEN** admin 用户将 `virtual_product_type` 设为 `resource` 但未提供 `resource_file_asset_id`
- **THEN** 系统返回 HTTP 400，提示"请为数字资料商品选择对应的文件"

#### Scenario: 资料类商品保存时引用不存在的文件资产
- **WHEN** admin 用户提供的 `resource_file_asset_id` 在 `file_asset` 表中不存在
- **THEN** 系统返回 HTTP 400，提示"所选文件不存在，请重新选择"

#### Scenario: 课程类型商品配置不变
- **WHEN** admin 用户将 `virtual_product_type` 设为 `course`
- **THEN** 配置行为与之前一致，通过 `virtual_course_id` 关联课程，不涉及文件资产字段
