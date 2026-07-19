# Direct-to-R2 File Uploads Guide

This document outlines the 3-step process for uploading files directly to Cloudflare R2 from the frontend. This approach ensures faster uploads and allows for real-time progress bars.

## 1. Request Upload URLs
Before uploading any file, request secure, temporary upload URLs from the backend.

- **Endpoint**: `POST /api/core/uploads/generate/`
- **Auth**: `AllowAny` (Works for both authenticated users and public access requests)
- **Payload**: Send an array of files containing the `filename`, `fileType`, and `contentType`.

> [!TIP]
> Valid `fileType` options are: `gym_photo`, `profile_photo`, `community_post`, `chat_file`, `cv`, `license`, `certification`.

**Request Example:**
```json
{
  "files": [
    {
      "filename": "my-cover.jpg",
      "fileType": "gym_photo",
      "contentType": "image/jpeg"
    },
    {
      "filename": "my-cv.pdf",
      "fileType": "cv",
      "contentType": "application/pdf"
    }
  ]
}
```

**Response Example:**
```json
{
  "urls": [
    {
      "uploadUrl": "https://gymspot-public.r2.cloudflarestorage.com/temp/gym_photos/uuid1.jpg?X-Amz-Signature=...",
      "filePath": "temp/gym_photos/uuid1.jpg",
      "isPrivate": false
    },
    {
      "uploadUrl": "https://gymspot-private.r2.cloudflarestorage.com/temp/cvs/uuid2.pdf?X-Amz-Signature=...",
      "filePath": "temp/cvs/uuid2.pdf",
      "isPrivate": true
    }
  ]
}
```

**Important**: Store the `filePath` returned for each file, as you will need it for the final submission in Step 3.

---

## 2. Upload Directly to Cloudflare (with Progress)
Using the `uploadUrl` obtained in Step 1, make an HTTP `PUT` request directly to Cloudflare R2. The payload must be the raw binary `File` object (Do NOT use `FormData`).

**Axios Example (with Progress Bar):**
```javascript
const uploadFileToR2 = async (file, uploadUrl, contentType) => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
        // Update your UI progress bar state here
      }
    });
    console.log("File uploaded successfully to Cloudflare R2!");
  } catch (error) {
    console.error("Upload failed", error);
  }
};
```

> [!IMPORTANT]
> The `Content-Type` header in this PUT request must **exactly match** the `contentType` you sent to the backend in Step 1.

---

## 3. Submit the Final Payload to the Backend
Once the direct upload is successful, the file resides in a temporary location in Cloudflare R2. To finalize the process, submit your primary form data to the backend as standard JSON, injecting the `filePath` you saved from Step 1.

**Example (Updating Gym Profile):**
- **Endpoint**: `PATCH /api/gyms/profile/`
- **Payload**:
```json
{
  "gym_name": "Gold's Gym",
  "description": "Best gym in town",
  "main_photo": "temp/gym_photos/uuid1.jpg"
}
```

> [!NOTE]
> **Understanding the `temp/` Prefix**
> All generated upload paths begin with `temp/`. This is an automatic garbage collection mechanism. 
> - If a user uploads an image but abandons the form, the file remains in `temp/` and is automatically deleted by Cloudflare after 24 hours.
> - When you complete Step 3, the backend automatically detects the `temp/` prefix, securely moves the file to its permanent location in R2, and saves the clean path to the database. You do not need to alter the path; simply send it exactly as received in Step 1.
