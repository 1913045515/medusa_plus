## Why

当前首页模板管理已经支持创建、编辑、保存和发布，但缺少日常运营最基础的删除和复制能力。没有复制能力会导致模板迭代只能手动重复粘贴源码，没有删除能力则会让草稿和废弃模板持续堆积，降低后台可维护性。

## What Changes

- 为首页模板管理新增复制功能，允许基于现有模板快速生成新的草稿版本。
- 为首页模板管理新增删除功能，允许移除不再需要的模板记录。
- 限制当前活动模板不可直接删除，避免 storefront 首页失去已发布配置。
- 扩展 Admin API 和后台页面，支持复制、删除按钮和结果反馈。

## Capabilities

### New Capabilities
- `homepage-template-record-actions`: 管理首页模板记录的复制与删除操作，以及相应的安全限制。

### Modified Capabilities
- None.

## Impact

- Backend: my-store 需要扩展首页模板 repository、service 和 admin API。
- Admin: my-store/src/admin/routes/homepage/page.tsx 需要新增复制、删除交互。
- Docs / Specs: 需要补充模板记录操作能力的需求和任务。

## Non-goals

- 不实现模板历史版本对比、撤销恢复或回收站。
- 不支持批量删除或批量复制。
- 不改变 storefront 首页模板渲染逻辑。