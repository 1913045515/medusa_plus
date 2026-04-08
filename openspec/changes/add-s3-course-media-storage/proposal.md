## Why

当前课程管理仍然通过手工填写图片和视频 URL 的方式维护媒体资源，既无法统一接入受控的 S3 存储，也无法满足课程视频需要短期授权访问、前台过期后可刷新恢复访问的业务要求。随着课程内容进入正式运营阶段，需要把 course 和 lesson 的媒体上传、存储、签名分发与过期处理统一收敛到后台和 storefront 的标准流程里。

## What Changes

- 新增 admin 课程媒体上传能力，支持 course 封面、lesson 封面、lesson 视频通过后台上传按钮写入 S3，并支持删除后重新上传。
- 扩展 course 和 lesson 数据模型，持久化原始 S3 永久地址以及上传文件名称、大小、类型、对象 key 等媒体元数据。
- 调整 admin 课程管理界面，上传成功后仅显示文件名和后缀等摘要信息，不显示永久 S3 地址。
- 调整 storefront 课程展示和播放接口，由后端按需生成临时签名 URL；视频签名默认有效期为 2 小时，并在过期后提供刷新访问能力。
- 收紧前台媒体暴露面，禁止将永久 S3 地址下发到 storefront，并以应用层方式减少视频地址复制与直接下载入口。

## Capabilities

### New Capabilities
- `course-media-asset-management`: 管理 course 与 lesson 媒体文件的 S3 上传、替换、删除、元数据持久化和 admin 展示。
- `course-media-signed-delivery`: 为 storefront 渲染和播放生成临时签名媒体地址，并处理视频访问过期后的恢复流程。

### Modified Capabilities
- None.

## Impact

- Backend: `my-store` 需要新增 S3 媒体服务、课程模块迁移、admin/store API 与序列化逻辑。
- Admin: `my-store/src/admin/routes/courses/[id]/page.tsx` 及课程管理相关 i18n 需要改为文件上传和文件摘要展示。
- Storefront: `my-store-storefront` 需要改造课程封面、lesson 封面和视频播放的数据获取与过期刷新交互。
- Infrastructure: 需要新增 S3 访问环境变量与部署配置，不能把 IAM 密钥直接提交到仓库。

## Non-goals

- 不在本次变更中实现 DRM、水印、录屏防护或浏览器级绝对防复制能力。
- 不改造课程模块以外的商品图片、首页图片或其他静态资源上传链路。
- 不在本次变更中引入浏览器直传 S3、分片断点续传或多存储提供商抽象。