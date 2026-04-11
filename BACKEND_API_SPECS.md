# Gym Web - Backend API Documentation (Auth Cycle)

This document outlines the expected request payloads (Body) for the backend APIs based on the current frontend form implementations.

---

## 1. Request Access (Coach / Gym)
**Endpoint:** `POST /api/request-access`  
**Content-Type:** `multipart/form-data`

### A. Coach Payload
| Key | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Always `"coach"` |
| `name` | `string` | Full legal name |
| `email` | `string` | Email address |
| `phone` | `string` | Phone number |
| `specialization` | `string[]` | Array of specialization IDs (e.g., `["fat-loss", "yoga"]`) |
| `experience` | `number` | Years of experience |
| `desc` | `string` | Professional Description / Bio |
| `certifications` | `File[]` | Multiple image files (Certificates) |

### B. Gym Payload
| Key | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Always `"gym"` |
| `gymName` | `string` | Name of the facility |
| `contactPerson`| `string` | Full name of the representative |
| `email` | `string` | Primary contact email |
| `phone` | `string` | Primary contact phone |
| `city` | `string` | City ID (e.g., `"cairo"`, `"giza"`) |
| `area` | `string` | Area name |
| `gymAddress` | `string` | Detailed street address |
| `memberCount` | `number` | Approximate number of members |
| `gymLicense` | `File` | Image of the facility license |
| `gymPhoto` | `File` | Main photo of the facility |

---

## 2. Normal User Registration
**Endpoint:** `POST /api/auth/register`  
**Content-Type:** `application/json`

| Key | Type | Description |
| :--- | :--- | :--- |
| `fullName` | `string` | User's full name |
| `email` | `string` | User's email |
| `phone` | `string` | User's phone number |
| `password` | `string` | Secure password |
| `confirmPassword` | `string` | Password confirmation |

---

## 3. Profile Activation (via Invite Code)
**Endpoint:** `POST /api/auth/activate`  
**Content-Type:** `application/json`

| Key | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | User's registered email |
| `inviteCode` | `string` | 8-character code sent to verified coaches/gyms |
| `password` | `string` | New password for the account |
| `confirmPassword`| `string` | Password confirmation (should be validated by backend too) |

---

## 4. Login
**Endpoint:** `POST /api/auth/login`  
**Content-Type:** `application/json`

| Key | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | User's registered email |
| `password` | `string` | User's password |

---

## 5. OTP Verification
**Endpoint:** `POST /api/auth/verify-otp`  
**Content-Type:** `application/json`

| Key | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | User's email (to identify the session) |
| `otp` | `string` | The 4-6 digit code sent via email/SMS |

---

> **Note:** For endpoints using `multipart/form-data` (Coach/Gym requests), ensure the backend handles array fields like `specialization` and file arrays like `certifications` correctly.
