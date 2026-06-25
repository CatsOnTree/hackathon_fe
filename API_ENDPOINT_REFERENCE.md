# API Endpoint Reference

Base URL: `http://localhost:8080`

All protected endpoints require:

```http
Authorization: Bearer <jwt-token>
```

Dates use ISO format (`YYYY-MM-DD`). Date-time values are returned as ISO local date-time strings.

## Roles and Public Access

| Access | Endpoints |
| --- | --- |
| Public | `POST /api/auth/login`, `POST /api/participants/register`, `GET /api/events`, `GET /api/events/{id}` |
| `ROLE_ADMIN` | `POST /api/auth/register`, `POST /api/events`, `/api/dashboard/**`, `/api/panelists/**`, `/api/assignments/**`, `/api/squads/**` |
| `ROLE_ADMIN` or `ROLE_PANELIST` | `GET /api/participants/**`, `/api/feedback/**` |

## Common Models

### Error Response

Returned for validation failures, missing resources, bad credentials, authorization failures, and unexpected errors.

```json
{
  "timestamp": "2026-06-25T16:30:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validationErrors": {
    "email": "must be a well-formed email address"
  }
}
```

Common status codes:

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Validation failed, duplicate check-in, duplicate username/email, or invalid business action |
| `401 Unauthorized` | Missing/invalid token or invalid login credentials |
| `403 Forbidden` | Authenticated user does not have the required role |
| `404 Not Found` | Referenced event, participant, panelist, or squad does not exist |
| `500 Internal Server Error` | Unexpected server error |

### Event

```json
{
  "id": 1,
  "name": "AI Hiring Hackathon",
  "description": "Recruitment event for backend engineers",
  "eventDate": "2026-07-01",
  "status": "OPEN",
  "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
  "qrCodeUrl": "http://localhost:8080/uploads/qrcodes/example-registration.png"
}
```

`status` values: `DRAFT`, `OPEN`, `CLOSED`, `COMPLETED`.

### Participant

```json
{
  "id": 1,
  "participantCode": "PART-0001",
  "eventId": 1,
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "experienceYears": 3,
  "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
  "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
  "aiScore": 82,
  "skills": "Java, Spring, PostgreSQL",
  "status": "REGISTERED"
}
```

`status` values: `REGISTERED`, `CHECKED_IN`, `ASSIGNED`, `SELECTED`, `REJECTED`.

### Panelist

```json
{
  "id": 1,
  "name": "Dr. Meera Shah",
  "email": "meera@example.com",
  "domain": "Backend"
}
```

### Assignment

```json
{
  "id": 1,
  "participantId": 1,
  "panelistId": 1
}
```

### Feedback

```json
{
  "id": 1,
  "participantId": 1,
  "panelistId": 1,
  "technicalRating": 5,
  "communicationRating": 4,
  "recommendation": "HIRE",
  "comments": "Strong backend fundamentals"
}
```

`recommendation` values: `HIRE`, `HOLD`, `REJECT`.

### Squad

```json
{
  "id": 1,
  "eventId": 1,
  "name": "Team Alpha"
}
```

### Squad Member

```json
{
  "id": 1,
  "squadId": 1,
  "participantId": 1
}
```

## Authentication Endpoints

### Login

`POST /api/auth/login`

Access: Public

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be a valid email |
| `password` | string | Yes | Must not be blank |

Request example:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response: `200 OK`

```json
{
  "token": "<jwt-token>",
  "role": "ROLE_ADMIN",
  "username": "admin"
}
```

Notes:

- Use the returned `token` in the `Authorization` header for protected endpoints.
- Invalid credentials return `401 Unauthorized`.

### Register User

`POST /api/auth/register`

Access: `ROLE_ADMIN`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `username` | string | Yes | Must not be blank; must be unique |
| `email` | string | Yes | Must be a valid email; must be unique |
| `password` | string | Yes | Must not be blank |
| `role` | string | Yes | `ROLE_ADMIN` or `ROLE_PANELIST` |

Request example:

```json
{
  "username": "panelist1",
  "email": "panelist1@example.com",
  "password": "password123",
  "role": "ROLE_PANELIST"
}
```

Response: `201 Created`

```json
{
  "token": "<jwt-token>",
  "role": "ROLE_PANELIST",
  "username": "panelist1"
}
```

## Event Endpoints

### Create Event

`POST /api/events`

Access: `ROLE_ADMIN`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | Must not be blank |
| `description` | string | No | Optional |
| `eventDate` | date | Yes | Must be today or a future date |
| `status` | string | No | `DRAFT`, `OPEN`, `CLOSED`, or `COMPLETED`; defaults to `OPEN` |

Request example:

```json
{
  "name": "AI Hiring Hackathon",
  "description": "Recruitment event for backend engineers",
  "eventDate": "2026-07-01",
  "status": "OPEN"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "name": "AI Hiring Hackathon",
  "description": "Recruitment event for backend engineers",
  "eventDate": "2026-07-01",
  "status": "OPEN",
  "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
  "qrCodeUrl": "http://localhost:8080/uploads/qrcodes/1-registration.png"
}
```

### Get All Events

`GET /api/events`

Access: Public

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "name": "AI Hiring Hackathon",
    "description": "Recruitment event for backend engineers",
    "eventDate": "2026-07-01",
    "status": "OPEN",
    "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
    "qrCodeUrl": "http://localhost:8080/uploads/qrcodes/1-registration.png"
  }
]
```

### Get Event By ID

`GET /api/events/{id}`

Access: Public

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | number | Yes | Event ID |

Request: No request body.

Response: `200 OK`

```json
{
  "id": 1,
  "name": "AI Hiring Hackathon",
  "description": "Recruitment event for backend engineers",
  "eventDate": "2026-07-01",
  "status": "OPEN",
  "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
  "qrCodeUrl": "http://localhost:8080/uploads/qrcodes/1-registration.png"
}
```

## Participant Endpoints

### Register Participant - JSON

`POST /api/participants/register`

Access: Public

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `eventId` | number | Yes | Must reference an existing event |
| `name` | string | Yes | Must not be blank |
| `email` | string | Yes | Must be a valid email |
| `phone` | string | No | Optional |
| `experienceYears` | number | No | Must be `0` or greater when provided |

Request example:

```json
{
  "eventId": 1,
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "experienceYears": 3
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "participantCode": "PART-0001",
  "eventId": 1,
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "experienceYears": 3,
  "resumeUrl": null,
  "photoUrl": null,
  "aiScore": 82,
  "skills": "Java, Spring, PostgreSQL",
  "status": "REGISTERED"
}
```

### Register Participant - Multipart

`POST /api/participants/register`

Access: Public

Content-Type: `multipart/form-data`

Form fields:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `eventId` | number | Yes | Must reference an existing event |
| `name` | string | Yes | Must not be blank |
| `email` | string | Yes | Must be a valid email |
| `phone` | string | No | Optional |
| `experienceYears` | number | No | Must be `0` or greater when provided |
| `resume` | file | No | Optional file upload |
| `photo` | file | No | Optional file upload |

Request example:

```bash
curl -X POST http://localhost:8080/api/participants/register \
  -F "eventId=1" \
  -F "name=Asha Rao" \
  -F "email=asha@example.com" \
  -F "phone=+919876543210" \
  -F "experienceYears=3" \
  -F "resume=@resume.pdf" \
  -F "photo=@photo.png"
```

Response: `201 Created`

```json
{
  "id": 1,
  "participantCode": "PART-0001",
  "eventId": 1,
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "experienceYears": 3,
  "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
  "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
  "aiScore": 82,
  "skills": "Java, Spring, PostgreSQL",
  "status": "REGISTERED"
}
```

### Get All Participants

`GET /api/participants`

Access: `ROLE_ADMIN` or `ROLE_PANELIST`

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "participantCode": "PART-0001",
    "eventId": 1,
    "name": "Asha Rao",
    "email": "asha@example.com",
    "phone": "+919876543210",
    "experienceYears": 3,
    "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
    "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
    "aiScore": 82,
    "skills": "Java, Spring, PostgreSQL",
    "status": "REGISTERED"
  }
]
```

### Get Participant By ID

`GET /api/participants/{id}`

Access: `ROLE_ADMIN` or `ROLE_PANELIST`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | number | Yes | Participant ID |

Request: No request body.

Response: `200 OK`

```json
{
  "id": 1,
  "participantCode": "PART-0001",
  "eventId": 1,
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+919876543210",
  "experienceYears": 3,
  "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
  "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
  "aiScore": 82,
  "skills": "Java, Spring, PostgreSQL",
  "status": "REGISTERED"
}
```

### Get Participants By Event

`GET /api/participants/event/{eventId}`

Access: `ROLE_ADMIN` or `ROLE_PANELIST`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `eventId` | number | Yes | Event ID |

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "participantCode": "PART-0001",
    "eventId": 1,
    "name": "Asha Rao",
    "email": "asha@example.com",
    "phone": "+919876543210",
    "experienceYears": 3,
    "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
    "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
    "aiScore": 82,
    "skills": "Java, Spring, PostgreSQL",
    "status": "REGISTERED"
  }
]
```

## Attendance Endpoints

### Check In Participant

`POST /api/attendance/check-in`

Access: Any authenticated user

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `participantCode` | string | Yes | Must not be blank; must match an existing participant |

Request example:

```json
{
  "participantCode": "PART-0001"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "participantId": 1,
  "checkinTime": "2026-06-25T16:30:00.000"
}
```

Notes:

- The participant status is updated to `CHECKED_IN`.
- A duplicate check-in returns `400 Bad Request` with message `Participant already checked in`.

## Panelist Endpoints

### Create Panelist

`POST /api/panelists`

Access: `ROLE_ADMIN`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `name` | string | Yes | Must not be blank |
| `email` | string | Yes | Must be a valid email |
| `domain` | string | Yes | Must not be blank |

Request example:

```json
{
  "name": "Dr. Meera Shah",
  "email": "meera@example.com",
  "domain": "Backend"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "name": "Dr. Meera Shah",
  "email": "meera@example.com",
  "domain": "Backend"
}
```

### Get All Panelists

`GET /api/panelists`

Access: `ROLE_ADMIN`

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "name": "Dr. Meera Shah",
    "email": "meera@example.com",
    "domain": "Backend"
  }
]
```

## Assignment Endpoints

### Create Assignment

`POST /api/assignments`

Access: `ROLE_ADMIN`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `participantId` | number | Yes | Must reference an existing participant |
| `panelistId` | number | Yes | Must reference an existing panelist |

Request example:

```json
{
  "participantId": 1,
  "panelistId": 1
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "participantId": 1,
  "panelistId": 1
}
```

Notes:

- The participant status is updated to `ASSIGNED`.

### Get All Assignments

`GET /api/assignments`

Access: `ROLE_ADMIN`

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "participantId": 1,
    "panelistId": 1
  }
]
```

## Feedback Endpoints

### Create Feedback

`POST /api/feedback`

Access: `ROLE_ADMIN` or `ROLE_PANELIST`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `participantId` | number | Yes | Must reference an existing participant |
| `panelistId` | number | Yes | Must reference an existing panelist |
| `technicalRating` | number | Yes | Integer from `1` to `5` |
| `communicationRating` | number | Yes | Integer from `1` to `5` |
| `recommendation` | string | Yes | `HIRE`, `HOLD`, or `REJECT` |
| `comments` | string | No | Optional |

Request example:

```json
{
  "participantId": 1,
  "panelistId": 1,
  "technicalRating": 5,
  "communicationRating": 4,
  "recommendation": "HIRE",
  "comments": "Strong backend fundamentals"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "participantId": 1,
  "panelistId": 1,
  "technicalRating": 5,
  "communicationRating": 4,
  "recommendation": "HIRE",
  "comments": "Strong backend fundamentals"
}
```

### Get All Feedback

`GET /api/feedback`

Access: `ROLE_ADMIN` or `ROLE_PANELIST`

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "participantId": 1,
    "panelistId": 1,
    "technicalRating": 5,
    "communicationRating": 4,
    "recommendation": "HIRE",
    "comments": "Strong backend fundamentals"
  }
]
```

## Squad Endpoints

### Create Squad

`POST /api/squads`

Access: `ROLE_ADMIN`

Content-Type: `application/json`

Request body:

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `eventId` | number | Yes | Must reference an existing event |
| `name` | string | Yes | Must not be blank |

Request example:

```json
{
  "eventId": 1,
  "name": "Team Alpha"
}
```

Response: `201 Created`

```json
{
  "id": 1,
  "eventId": 1,
  "name": "Team Alpha"
}
```

### Add Squad Member

`POST /api/squads/{squadId}/members/{participantId}`

Access: `ROLE_ADMIN`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `squadId` | number | Yes | Squad ID |
| `participantId` | number | Yes | Participant ID |

Request: No request body.

Response: `201 Created`

```json
{
  "id": 1,
  "squadId": 1,
  "participantId": 1
}
```

### Get Squads By Event

`GET /api/squads/event/{eventId}`

Access: `ROLE_ADMIN`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `eventId` | number | Yes | Event ID |

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "eventId": 1,
    "name": "Team Alpha"
  }
]
```

### Get Squad Members

`GET /api/squads/{squadId}/members`

Access: `ROLE_ADMIN`

Path parameters:

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `squadId` | number | Yes | Squad ID |

Request: No request body.

Response: `200 OK`

```json
[
  {
    "id": 1,
    "participantCode": "PART-0001",
    "eventId": 1,
    "name": "Asha Rao",
    "email": "asha@example.com",
    "phone": "+919876543210",
    "experienceYears": 3,
    "resumeUrl": "http://localhost:8080/uploads/resumes/resume.pdf",
    "photoUrl": "http://localhost:8080/uploads/photos/photo.png",
    "aiScore": 82,
    "skills": "Java, Spring, PostgreSQL",
    "status": "REGISTERED"
  }
]
```

## Dashboard Endpoints

### Get Dashboard Summary

`GET /api/dashboard/summary`

Access: `ROLE_ADMIN`

Request: No request body.

Response: `200 OK`

```json
{
  "events": 2,
  "participants": 35,
  "checkedIn": 24,
  "assigned": 20,
  "feedbackSubmitted": 18,
  "emailsSent": 35
}
```
