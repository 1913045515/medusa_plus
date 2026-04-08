## 1. Backend media foundation

- [x] 1.1 Add S3 runtime configuration and a reusable upload/sign/delete service in my-store/medusa-config.ts and my-store/src/services or my-store/src/modules/course/services.
- [x] 1.2 Extend course and lesson media models, types, repositories, and migrations for permanent S3 URLs plus structured file metadata in my-store/src/modules/course/models, my-store/src/modules/course/types.ts, my-store/src/modules/course/repositories, and my-store/src/modules/course/migrations.
- [x] 1.3 Add unit coverage for media metadata persistence and signed URL generation in my-store/src/modules/course/__tests__.

## 2. Admin upload workflow

- [x] 2.1 Implement admin upload and delete endpoints for course thumbnails, lesson thumbnails, and lesson videos in my-store/src/api/admin and wire them to the S3 media service.
- [x] 2.2 Refactor the course management editor to use file uploads, file summaries, delete/re-upload actions, and upload error states in my-store/src/admin/routes/courses/[id]/page.tsx.
- [x] 2.3 Update admin translations and payload shaping so the UI shows file name, extension, size, and type instead of raw S3 URLs in my-store/src/admin/i18n/json/zh-CN.json and my-store/src/admin/i18n/json/en.json.

## 3. Store signed delivery and storefront playback

- [x] 3.1 Update course and lesson store serialization to sign S3-backed thumbnails and include expiry metadata for lesson play responses in my-store/src/modules/course/services/lesson.service.ts, my-store/src/modules/course/services/course.service.ts, and my-store/src/api/store.
- [x] 3.2 Update storefront lesson and course data contracts to accept signed URLs and expiry fields in my-store-storefront/src/types/course.ts, my-store-storefront/src/types/lesson.ts, and my-store-storefront/src/lib/data/lessons.ts.
- [x] 3.3 Refactor course list and lesson player rendering for signed thumbnails, expired-permission states, refresh access, and reduced download/copy affordances in my-store-storefront/src/modules/courses/templates/courses-grid.tsx and my-store-storefront/src/modules/courses/components/lesson-player.tsx.
- [x] 3.4 Adjust storefront remote media configuration for S3-backed signed images if required in my-store-storefront/next.config.js.

## 4. Verification and rollout docs

- [ ] 4.1 Add or update backend integration and storefront data tests for upload success, replace/delete flows, signed playback, expiry refresh, and auth failures in my-store/integration-tests/http, my-store/src/modules/course/__tests__, and my-store-storefront/src/lib/data/__tests__/lessons.spec.ts.
- [x] 4.2 Document required S3 environment variables, secret handling, and deployment validation steps in my-store/README.md and docs/ubuntu-deploy-guide.md or related deployment docs.