## ADDED Requirements

### Requirement: Admin can upload course and lesson media to S3
The system SHALL allow admin users to upload the course thumbnail, lesson thumbnail, and lesson video from the course management UI, and the backend MUST store each uploaded file in the configured S3 bucket through a server-side upload flow.

#### Scenario: Upload a course thumbnail
- **WHEN** an admin selects a course cover image and confirms upload in the course editor
- **THEN** the backend stores the file in S3, associates it with the course record, and returns a media summary that the admin UI can display

#### Scenario: Upload a lesson video
- **WHEN** an admin selects a lesson video file and confirms upload in the lesson editor
- **THEN** the backend stores the file in S3, associates it with the lesson record, and returns a media summary without exposing the permanent S3 URL in the UI

### Requirement: Admin can replace or delete uploaded media
The system SHALL allow admin users to remove an uploaded course thumbnail, lesson thumbnail, or lesson video and upload a replacement from the same management workflow.

#### Scenario: Replace an existing lesson thumbnail
- **WHEN** an admin uploads a new lesson thumbnail for a lesson that already has one
- **THEN** the lesson record is updated to reference the new S3 object and the previous object is scheduled for deletion or removed immediately by the backend

#### Scenario: Delete and re-upload a course thumbnail
- **WHEN** an admin deletes an uploaded course thumbnail and then uploads a new file
- **THEN** the admin UI clears the previous file summary and shows the newly uploaded file summary after the replacement succeeds

### Requirement: Media metadata is persisted with each course and lesson record
The system SHALL persist the canonical S3 address and structured file metadata for each managed media field so that course and lesson records retain the original file name, file extension, MIME type, file size, bucket key, and upload timestamp.

#### Scenario: Save uploaded media metadata on a course
- **WHEN** a course thumbnail upload succeeds
- **THEN** the course record stores the permanent S3 address and the structured metadata needed to render file name, extension, type, and size in admin

#### Scenario: Save uploaded media metadata on a lesson
- **WHEN** a lesson thumbnail or lesson video upload succeeds
- **THEN** the lesson record stores the permanent S3 address and the structured metadata needed for replacement, deletion, and storefront signing

### Requirement: Admin displays file summaries instead of raw storage URLs
The system SHALL display uploaded media in admin as file summaries and MUST NOT require users to view or manually copy permanent S3 URLs to manage course media.

#### Scenario: Display an uploaded file summary
- **WHEN** an admin reopens a course or lesson that already has uploaded media
- **THEN** the UI shows the stored file name, extension, size, and type summary for that media field

#### Scenario: Hide the permanent URL in admin workflows
- **WHEN** an upload or fetch request returns media information for admin management
- **THEN** the permanent S3 URL is retained for persistence and backend logic but is not rendered as editable text in the course management form