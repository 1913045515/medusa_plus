## Context

当前仓库已经具备课程购买后授予学习权限的基础能力：课程可通过 `course.product_id` 与 `product.metadata.course_id` 建立关联，购买后通过 `my-store/src/api/store/course-purchases/from-order/route.ts` 写入 `course_purchase`。但商品后台尚未显式支持“虚拟资料”和“虚拟课程”两类配置，订单详情页也未保存和展示虚拟交付信息。

这次变更横跨 Medusa 商品扩展、课程关联、订单落库、admin 表单、storefront 订单详情与 i18n，且涉及订单快照与迁移策略，因此需要独立设计文档先固定实现边界。

## Goals / Non-Goals

**Goals:**
- 为商品增加统一的虚拟商品配置能力，支持 `resource` 与 `course` 两种类型。
- 让后台按类型强制填写下载地址或课程关联，并将虚拟类型以 code 形式存储。
- 在订单生成后为每个虚拟商品行保存交付快照，避免后续商品变更影响已成交订单。
- 在订单详情中按当前语言展示虚拟类型名称，并提供课程跳转或资料下载入口。
- 保持课程模块中的 `product_id` 为可选，支持从商品侧绑定课程。

**Non-Goals:**
- 不引入新的虚拟商品类型或复杂的数字版权管理能力。
- 不改造既有课程是否已购买的鉴权规则。
- 不对历史订单做强制回填；新快照仅保证变更上线后的新订单。

## Decisions

### 1. 商品虚拟属性存储在 product metadata，而不是新建独立商品扩展表

商品端将统一存储以下 code 字段：`is_virtual`、`virtual_product_type`、`resource_download_url`、`virtual_course_id`、`virtual_course_path`。后台表单通过自定义 widget 或扩展接口读写这些字段，并在保存前做类型相关校验。

Rationale:
- Medusa 商品已经承载课程关联 metadata，继续沿用 metadata 能减少核心模型侵入。
- admin 商品详情现有自定义 widget 已在仓库中使用，扩展成本低。

Alternatives considered:
- 新建独立模块表保存虚拟商品配置：结构更强，但会引入额外 join、同步和查询复杂度，超出本次最小改动目标。

### 2. 订单交付信息以订单行快照形式持久化，而不是在订单详情时回读商品实时数据

每个虚拟商品购买成功后，系统在订单行中保存交付快照，最少包含：`is_virtual`、`virtual_product_type`、`resource_download_url`、`virtual_course_id`、`virtual_course_path`。订单详情与确认页仅读取该快照显示交付信息，不依赖商品当前 metadata。

Rationale:
- 订单是成交时快照，不能因商品后续改动导致历史订单展示变化。
- storefront 订单详情已按订单行渲染，补充订单行元数据的展示最容易落地。

Alternatives considered:
- 每次查看订单都回读商品 metadata：实现简单，但会导致历史订单展示漂移，不满足成交快照需求。

### 3. 课程绑定采用“商品侧必填、课程侧选填”的双向同步策略

当商品被标记为 `course` 类型时，后台必须选择一个课程；保存后系统同步写入商品 metadata 与课程 `product_id`。课程编辑页保留 `product_id` 字段，但不再要求必须选择，允许清空，以避免只有课程侧能建立关系的单向约束。

Rationale:
- 用户要求以商品配置为主入口，并保持课程端可选，便于双向维护。
- 现有课程页已支持 `product_id || null`，与此策略兼容。

Alternatives considered:
- 继续以课程侧强绑定商品：无法满足商品中直接配置虚拟课程的运营流程。

### 4. 虚拟类型只存 code，展示名称通过 admin/storefront i18n 翻译

系统内部与订单快照只保存 `resource`、`course` 这样的稳定 code，所有页面显示层通过 locale 字典将 code 转成当前语言名称。API 与数据库不保存中文或英文展示名。

Rationale:
- 满足多语言与稳定存储要求，避免后续改文案触发数据迁移。

Alternatives considered:
- 同时存 code 和展示文案：会造成订单数据冗余，且文案跨语言不可维护。

## Risks / Trade-offs

- [商品 metadata 缺少结构约束] → 通过 admin 表单校验、服务端路由校验和集成测试共同兜底。
- [订单行快照写入时机不一致] → 统一在订单成功后与课程购买授权同一流程内完成，保证授权与展示数据来源一致。
- [课程路径失效] → 快照只存相对路径并在保存时校验课程 handle/路由可推导，避免写入环境相关绝对地址。
- [历史订单无快照] → 上线说明明确仅覆盖新订单；如需要补录，后续单独提供脚本。

## Migration Plan

1. 为商品虚拟配置与订单行快照增加后端读写支持，并补充必要的数据库或 metadata 写入路径。
2. 发布 admin 商品编辑能力与课程页可选绑定调整。
3. 在订单成功流程中写入虚拟交付快照，同时保持课程购买授权继续生效。
4. 发布 storefront 订单详情展示与跳转/下载入口。
5. 更新 OpenAPI、测试与部署文档；如回滚，先关闭前端展示，再回滚写入逻辑以避免新旧数据不一致。

## Open Questions

- 资料下载地址本期默认采用可直接访问的 URL；如果后续需要签名下载，应另起变更，不在本次设计内。