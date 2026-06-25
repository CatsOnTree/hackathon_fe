# AI Recruitment Event Platform - Project Documentation

## 1. Project Overview

This project is a Spring Boot backend for managing recruitment or hackathon-style events. It supports event creation, participant registration, resume/photo uploads, AI-style resume scoring, participant check-in, panelist assignment, feedback collection, squad grouping, email logging, and dashboard counts.

Base URL:

```text
http://localhost:8080
```

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## 2. Technology Stack

- Java 21 target
- Spring Boot 3.3.6
- Spring Web
- Spring Data JPA
- PostgreSQL
- Jakarta Validation
- Lombok
- Apache Tika for resume text extraction
- ZXing for QR code generation
- Springdoc OpenAPI
- Maven

## 3. Application Configuration

Main configuration file:

```text
src/main/resources/application.properties
```

Important properties:

```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/hackathon_db
spring.datasource.username=postgres
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
app.base-url=http://localhost:8080
app.upload-dir=uploads
```

Uploaded files are stored under:

```text
uploads/
```

## 4. Implementation Flow

### Events

When an event is created, the backend:

1. Saves the event.
2. Builds a registration URL in this format:

```text
http://localhost:8080/api/participants/register?eventId={eventId}
```

3. Generates a QR code image for the registration URL.
4. Stores the QR image in the uploads folder.
5. Saves `registrationUrl` and `qrCodeUrl` on the event record.

### Participant Registration

Participants can register in two ways:

- JSON request without files.
- Multipart form request with optional `resume` and `photo` files.

During registration, the backend:

1. Validates that the event exists.
2. Generates a participant code like `PART-0002`.
3. Stores uploaded resume/photo files if present.
4. Runs mock resume analysis with Apache Tika.
5. Calculates `aiScore` and detected `skills`.
6. Saves participant with status `REGISTERED`.
7. Logs a mock email confirmation.

### Attendance

Check-in uses `participantCode`. On successful check-in:

1. A participant is found by code.
2. Duplicate check-in is rejected.
3. Participant status changes to `CHECKED_IN`.
4. Attendance record is saved with current timestamp.

### Assignment

Assignment links a participant to a panelist. On assignment:

1. Participant must exist.
2. Panelist must exist.
3. Participant status changes to `ASSIGNED`.
4. Assignment record is saved.

### Feedback

Feedback stores technical rating, communication rating, recommendation, and comments for a participant-panelist pair.

### Squads

Squads group participants under an event. A squad must belong to an existing event, and members must be existing participants.

### Dashboard

Dashboard summary returns counts for events, participants, checked-in participants, assignments, feedback records, and email logs.

## 5. Common Response Models

### Error Response

All handled errors use this shape:

```json
{
  "timestamp": "2026-06-25T12:30:00.000",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "validationErrors": {
    "email": "must be a well-formed email address"
  }
}
```

Common status codes:

- `200 OK` for successful reads.
- `201 Created` for successful creates.
- `400 Bad Request` for validation errors or invalid actions.
- `404 Not Found` when an entity does not exist.
- `500 Internal Server Error` for unexpected errors.

## 6. Enums

### EventStatus

```text
DRAFT, OPEN, CLOSED, COMPLETED
```

### ParticipantStatus

```text
REGISTERED, CHECKED_IN, ASSIGNED, SELECTED, REJECTED
```

### Recommendation

```text
HIRE, HOLD, REJECT
```

## 7. Endpoint Documentation

### 7.1 Events

#### Create Event

```http
POST /api/events
Content-Type: application/json
```

Request:

```json
{
  "name": "AI Hiring Drive 2026",
  "description": "Campus and lateral recruitment event.",
  "eventDate": "2026-07-10",
  "status": "OPEN"
}
```

Validation:

- `name` is required.
- `eventDate` is required and must be today or a future date.
- `status` is optional. If omitted, it defaults to `OPEN`.

Response `201 Created`:

```json
{
  "id": 1,
  "name": "AI Hiring Drive 2026",
  "description": "Campus and lateral recruitment event.",
  "eventDate": "2026-07-10",
  "status": "OPEN",
  "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
  "qrCodeUrl": "/uploads/qrcodes/uuid-registration.png"
}
```

#### Get All Events

```http
GET /api/events
```

Response `200 OK`:

```json
[
  {
    "id": 1,
    "name": "AI Hiring Drive 2026",
    "description": "Campus and lateral recruitment event.",
    "eventDate": "2026-07-10",
    "status": "OPEN",
    "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
    "qrCodeUrl": "/uploads/qrcodes/uuid-registration.png"
  }
]
```

#### Get Event By ID

```http
GET /api/events/{id}
```

Response `200 OK`:

```json
{
  "id": 1,
  "name": "AI Hiring Drive 2026",
  "description": "Campus and lateral recruitment event.",
  "eventDate": "2026-07-10",
  "status": "OPEN",
  "registrationUrl": "http://localhost:8080/api/participants/register?eventId=1",
  "qrCodeUrl": "/uploads/qrcodes/uuid-registration.png"
}
```

### 7.2 Participants

#### Register Participant - JSON

Use this when no files are uploaded.

```http
POST /api/participants/register
Content-Type: application/json
```

Request:

```json
{
  "eventId": 1,
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "experienceYears": 2
}
```

Validation:

- `eventId` is required.
- `name` is required.
- `email` is required and must be valid.
- `experienceYears` must be `0` or greater when provided.

Response `201 Created`:

```json
{
  "id": 2,
  "participantCode": "PART-0002",
  "eventId": 1,
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "experienceYears": 2,
  "resumeUrl": null,
  "photoUrl": null,
  "aiScore": 62,
  "skills": "Java, Spring, Spring Boot, PostgreSQL",
  "status": "REGISTERED"
}
```

#### Register Participant - Multipart With Files

Use this when uploading resume/photo files.

```http
POST /api/participants/register
Content-Type: multipart/form-data
```

Form fields:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `eventId` | number | yes | Event ID |
| `name` | string | yes | Participant name |
| `email` | string | yes | Participant email |
| `phone` | string | no | Participant phone |
| `experienceYears` | number | no | Years of experience |
| `resume` | file | no | Resume file |
| `photo` | file | no | Photo file |

Example curl:

```bash
curl -X POST http://localhost:8080/api/participants/register \
  -F "eventId=1" \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "phone=9876543210" \
  -F "experienceYears=2" \
  -F "resume=@resume.pdf" \
  -F "photo=@photo.jpg"
```

Response `201 Created`:

```json
{
  "id": 2,
  "participantCode": "PART-0002",
  "eventId": 1,
  "name": "Test User",
  "email": "test@example.com",
  "phone": "9876543210",
  "experienceYears": 2,
  "resumeUrl": "/uploads/resumes/uuid-resume.pdf",
  "photoUrl": "/uploads/photos/uuid-photo.jpg",
  "aiScore": 65,
  "skills": "Java, Spring Boot",
  "status": "REGISTERED"
}
```

#### Get All Participants

```http
GET /api/participants
```

Response `200 OK`:

```json
[
  {
    "id": 2,
    "participantCode": "PART-0002",
    "eventId": 1,
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "experienceYears": 2,
    "resumeUrl": "/uploads/resumes/uuid-resume.pdf",
    "photoUrl": "/uploads/photos/uuid-photo.jpg",
    "aiScore": 65,
    "skills": "Java, Spring Boot",
    "status": "REGISTERED"
  }
]
```

#### Get Participant By ID

```http
GET /api/participants/{id}
```

Response `200 OK` uses the same participant shape shown above.

#### Get Participants By Event

```http
GET /api/participants/event/{eventId}
```

Response `200 OK`:

```json
[
  {
    "id": 2,
    "participantCode": "PART-0002",
    "eventId": 1,
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "experienceYears": 2,
    "resumeUrl": "/uploads/resumes/uuid-resume.pdf",
    "photoUrl": "/uploads/photos/uuid-photo.jpg",
    "aiScore": 65,
    "skills": "Java, Spring Boot",
    "status": "REGISTERED"
  }
]
```

### 7.3 Attendance

#### Participant Check-In

```http
POST /api/attendance/check-in
Content-Type: application/json
```

Request:

```json
{
  "participantCode": "PART-0002"
}
```

Validation:

- `participantCode` is required.
- Duplicate check-in returns `400 Bad Request`.

Response `201 Created`:

```json
{
  "id": 1,
  "participantId": 2,
  "checkinTime": "2026-06-25T12:30:00.000"
}
```

### 7.4 Panelists

#### Create Panelist

```http
POST /api/panelists
Content-Type: application/json
```

Request:

```json
{
  "name": "Priya Menon",
  "email": "priya.menon@example.com",
  "domain": "Backend Engineering"
}
```

Validation:

- `name` is required.
- `email` is required and must be valid.
- `domain` is required.

Response `201 Created`:

```json
{
  "id": 1,
  "name": "Priya Menon",
  "email": "priya.menon@example.com",
  "domain": "Backend Engineering"
}
```

#### Get All Panelists

```http
GET /api/panelists
```

Response `200 OK`:

```json
[
  {
    "id": 1,
    "name": "Priya Menon",
    "email": "priya.menon@example.com",
    "domain": "Backend Engineering"
  }
]
```

### 7.5 Assignments

#### Create Assignment

```http
POST /api/assignments
Content-Type: application/json
```

Request:

```json
{
  "participantId": 2,
  "panelistId": 1
}
```

Validation:

- `participantId` is required and must exist.
- `panelistId` is required and must exist.

Response `201 Created`:

```json
{
  "id": 1,
  "participantId": 2,
  "panelistId": 1
}
```

Side effect:

- Participant status becomes `ASSIGNED`.

#### Get All Assignments

```http
GET /api/assignments
```

Response `200 OK`:

```json
[
  {
    "id": 1,
    "participantId": 2,
    "panelistId": 1
  }
]
```

### 7.6 Feedback

#### Create Feedback

```http
POST /api/feedback
Content-Type: application/json
```

Request:

```json
{
  "participantId": 2,
  "panelistId": 1,
  "technicalRating": 4,
  "communicationRating": 5,
  "recommendation": "HIRE",
  "comments": "Strong fundamentals and clear project explanation."
}
```

Validation:

- `participantId` is required and must exist.
- `panelistId` is required and must exist.
- `technicalRating` is required and must be between `1` and `5`.
- `communicationRating` is required and must be between `1` and `5`.
- `recommendation` is required. Allowed values: `HIRE`, `HOLD`, `REJECT`.

Response `201 Created`:

```json
{
  "id": 1,
  "participantId": 2,
  "panelistId": 1,
  "technicalRating": 4,
  "communicationRating": 5,
  "recommendation": "HIRE",
  "comments": "Strong fundamentals and clear project explanation."
}
```

#### Get All Feedback

```http
GET /api/feedback
```

Response `200 OK`:

```json
[
  {
    "id": 1,
    "participantId": 2,
    "panelistId": 1,
    "technicalRating": 4,
    "communicationRating": 5,
    "recommendation": "HIRE",
    "comments": "Strong fundamentals and clear project explanation."
  }
]
```

### 7.7 Squads

#### Create Squad

```http
POST /api/squads
Content-Type: application/json
```

Request:

```json
{
  "eventId": 1,
  "name": "Backend Squad"
}
```

Validation:

- `eventId` is required and must exist.
- `name` is required.

Response `201 Created`:

```json
{
  "id": 1,
  "eventId": 1,
  "name": "Backend Squad"
}
```

#### Add Participant To Squad

```http
POST /api/squads/{squadId}/members/{participantId}
```

Response `201 Created`:

```json
{
  "id": 1,
  "squadId": 1,
  "participantId": 2
}
```

#### Get Squads By Event

```http
GET /api/squads/event/{eventId}
```

Response `200 OK`:

```json
[
  {
    "id": 1,
    "eventId": 1,
    "name": "Backend Squad"
  }
]
```

#### Get Squad Members

```http
GET /api/squads/{squadId}/members
```

Response `200 OK`:

```json
[
  {
    "id": 2,
    "participantCode": "PART-0002",
    "eventId": 1,
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "experienceYears": 2,
    "resumeUrl": "/uploads/resumes/uuid-resume.pdf",
    "photoUrl": "/uploads/photos/uuid-photo.jpg",
    "aiScore": 65,
    "skills": "Java, Spring Boot",
    "status": "ASSIGNED"
  }
]
```

### 7.8 Dashboard

#### Get Dashboard Summary

```http
GET /api/dashboard/summary
```

Response `200 OK`:

```json
{
  "events": 1,
  "participants": 2,
  "checkedIn": 1,
  "assigned": 1,
  "feedbackSubmitted": 1,
  "emailsSent": 2
}
```

## 8. Local Run Steps

1. Create a PostgreSQL database:

```sql
CREATE DATABASE hackathon_db;
```

2. Confirm credentials in `application.properties`.

3. Start the application:

```bash
./mvnw spring-boot:run
```

On Windows:

```bat
mvnw.cmd spring-boot:run
```

4. Open Swagger:

```text
http://localhost:8080/swagger-ui.html
```

## 9. Testing

Run tests:

```bash
./mvnw test
```

If running on Java 24 with the current Mockito/Byte Buddy dependency versions, use:

```bash
./mvnw "-DargLine=-Dnet.bytebuddy.experimental=true" test
```

## 10. Seed Data

`DataLoader` inserts demo data only when the events table is empty. It creates:

- One sample event.
- One sample participant.
- One sample panelist.
- One assignment.
- One feedback record.
- One squad and squad member.
- One attendance record.
- One email log.

## 11. Security and Authentication

### 11.1 Security Overview

This project uses Spring Security 6 with JWT authentication and role-based authorization.

Key security components:
- `spring-boot-starter-security`
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson`
- `BCryptPasswordEncoder` for password hashing
- `@EnableMethodSecurity` in `SecurityConfig`
- `SecurityFilterChain` configuration (no `WebSecurityConfigurerAdapter`)
- `JwtAuthenticationFilter` for token validation

### 11.2 Authentication Model

The project introduces a `User` entity stored in the `users` table.

#### User entity

Fields:
- `id` (auto-generated)
- `username` (unique)
- `email` (unique)
- `password` (BCrypt hashed)
- `role` (`ROLE_ADMIN` or `ROLE_PANELIST`)

#### Role enum

```text
ROLE_ADMIN
ROLE_PANELIST
```

### 11.3 Default Admin Seeder

`AdminUserSeeder` creates a default admin user when the `users` table does not already have `admin@hackathon.com`.

Default admin:
- Email: `admin@hackathon.com`
- Username: `admin`
- Password: `Admin@123`
- Role: `ROLE_ADMIN`

### 11.4 JWT Configuration

Configuration properties in `src/main/resources/application.properties`:

```properties
jwt.secret=changeit1234567890changeit1234567890changeit1234567890
jwt.expiration-ms=86400000
```

The JWT flow is:
1. Client POSTs credentials to `/api/auth/login`
2. Server authenticates using `AuthenticationManager`
3. `JwtService` issues a JWT token with username and role claims
4. Client sends `Authorization: Bearer <token>` on protected requests
5. `JwtAuthenticationFilter` validates the token and sets the security context

### 11.5 Auth Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "admin@hackathon.com",
  "password": "Admin@123"
}
```

Response body:

```json
{
  "token": "jwt-token",
  "role": "ROLE_ADMIN",
  "username": "admin"
}
```

This endpoint is public and does not require authentication.

#### Register User

```http
POST /api/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "username": "panelist1",
  "email": "panelist1@example.com",
  "password": "Panelist@123",
  "role": "ROLE_PANELIST"
}
```

Response body:

```json
{
  "token": "jwt-token",
  "role": "ROLE_PANELIST",
  "username": "panelist1"
}
```

This endpoint requires `ROLE_ADMIN`.

### 11.6 Authorization Matrix

#### Public endpoints
- `POST /api/auth/login`
- `POST /api/participants/register`
- `GET /api/events`
- `GET /api/events/{id}`
- Swagger and OpenAPI UI endpoints (`/swagger-ui/**`, `/swagger-ui.html`, `/v3/api-docs/**`)

#### Admin-only endpoints
- `/api/dashboard/**`
- `/api/panelists/**`
- `/api/assignments/**`
- `/api/squads/**`
- `POST /api/events`
- `PUT /api/events/**`
- `DELETE /api/events/**`
- `POST /api/auth/register`

#### Admin + Panelist endpoints
- `GET /api/participants/**`
- `PUT /api/participants/**`
- `GET /api/feedback/**`
- `POST /api/feedback/**`
- `PUT /api/feedback/**`

### 11.7 Method-level Security

Controllers use `@PreAuthorize` annotations to enforce method-level authorization.

Examples:
- `@PreAuthorize("hasRole('ADMIN')")` for admin-only routes
- `@PreAuthorize("hasAnyRole('ADMIN','PANELIST')")` for shared access routes

### 11.8 Swagger / OpenAPI JWT Support

Swagger UI is configured to support bearer token authorization.
The OpenAPI document includes a security scheme named `Bearer Authentication`.

When using Swagger UI, users can click `Authorize` and provide a JWT token as `Bearer <token>`.

### 11.9 Security Classes

Important security classes:
- `com.hackathon.config.SecurityConfig`
- `com.hackathon.security.CustomUserDetailsService`
- `com.hackathon.security.JwtService`
- `com.hackathon.security.JwtAuthenticationFilter`
- `com.hackathon.service.AuthenticationService`
- `com.hackathon.controller.AuthController`
- `com.hackathon.config.AdminUserSeeder`

### 11.10 Notes on Authentication Behavior

- The `User` details are loaded by email in `CustomUserDetailsService`.
- Passwords are stored with BCrypt hashing.
- If a JWT is invalid or expired, the request is rejected with `401 Unauthorized`.
- Access denied due to insufficient role returns `403 Forbidden`.
- The registration endpoint for participants remains public and does not require authentication.

### 11.11 Database Impact

The new `users` table is created automatically by JPA with:
- `id`
- `username`
- `email`
- `password`
- `role`

Ensure your database migration or schema update strategy includes this table.

### 11.12 Testing Security

To test login and a protected route:

1. Login as admin:
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hackathon.com","password":"Admin@123"}'
   ```
2. Use the returned JWT in the `Authorization` header:
   ```bash
   curl -X GET http://localhost:8080/api/dashboard/summary \
     -H "Authorization: Bearer <token>"
   ```

To test panelist access, create a panelist user with admin credentials and use their token for feedback or participant views.

This makes the dashboard and list endpoints useful immediately after the first startup.
