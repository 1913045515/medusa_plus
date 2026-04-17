## ADDED Requirements

### Requirement: 文件资产列表与查看
admin 用户 SHALL 能够在"文件管理"模块查看已上传文件的列表，列表包含文件名、文件类型、文件大小、上传时间；支持按名称搜索和按上传时间排序；支持分页。

#### Scenario: 查看文件列表
- **WHEN** admin 用户进入文件管理页面
- **THEN** 系统展示所有已上传文件的分页列表，每条记录显示文件名、MIME 类型、大小（人类可读格式）、上传时间

#### Scenario: 按名称搜索
- **WHEN** admin 用户在搜索框中输入关键词
- **THEN** 系统仅返回文件名包含该关键词的文件记录（不区分大小写）

---

### Requirement: 文件上传到私有 S3
admin 用户 SHALL 能够通过文件管理模块上传文件，文件 SHALL 仅被写入私有 S3 桶，系统 SHALL 在数据库 `file_asset` 表中持久化文件元数据（`id`、`name`、`original_filename`、`s3_key`、`s3_bucket`、`mime_type`、`size_bytes`、`description`、`created_at`、`updated_at`）。文件大小上限为 500 MB，MIME 类型不限。

#### Scenario: 成功上传文件
- **WHEN** admin 用户选择文件并点击上传
- **THEN** 系统将文件写入私有 S3 桶（key 格式：`file-assets/{uuid}/{original_filename}`），在 `file_asset` 表插入元数据记录，返回新建文件的元数据，HTTP 201

#### Scenario: 文件超过大小限制
- **WHEN** admin 用户尝试上传大于 500 MB 的文件
- **THEN** 系统在接收文件后返回 HTTP 400，并提示"文件大小不能超过 500 MB"，不写入 S3

#### Scenario: S3 写入失败
- **WHEN** S3 写入操作返回错误
- **THEN** 系统返回 HTTP 500，错误信息记录到日志，不在数据库中插入文件记录

---

### Requirement: 文件删除
admin 用户 SHALL 能够删除文件管理模块中的文件，系统 SHALL 先检查该文件是否被任何商品配置引用；若有活跃引用则拒绝删除；通过检查后同时删除 S3 对象和 `file_asset` 数据库记录。

#### Scenario: 删除未被引用的文件
- **WHEN** admin 用户点击删除且该文件未被任何商品引用
- **THEN** 系统先删除 S3 桶中的对象，再删除 `file_asset` 数据库记录，返回 HTTP 200

#### Scenario: 删除被商品引用的文件
- **WHEN** admin 用户点击删除且该文件被至少一个商品的 `resource_file_asset_id` 引用
- **THEN** 系统返回 HTTP 409，提示"该文件被 N 个商品引用，请先移除商品中的文件关联"，不执行删除

#### Scenario: 删除时 S3 对象不存在
- **WHEN** S3 对象已不存在（如手动从 S3 删除）但数据库记录存在
- **THEN** 系统忽略 S3 删除错误（NoSuchKey），仍然删除数据库记录，返回 HTTP 200

---

### Requirement: 文件元数据编辑
admin 用户 SHALL 能够编辑文件的 `name`（显示名称）和 `description` 字段，不允许替换文件内容（替换需要先删除再上传）。

#### Scenario: 更新文件名和描述
- **WHEN** admin 用户修改文件的名称或描述并保存
- **THEN** 系统更新 `file_asset` 表对应记录，返回更新后的元数据，HTTP 200
