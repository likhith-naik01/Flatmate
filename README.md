# RoomMate - Find a Room & Roommate

RoomMate is a full-stack web application designed for students and working professionals to find rental rooms and compatible roommates. It features real-time search filtering, authenticated listing creation and editing, inquiry management with owner approvals, and profile customization.

The project is built cleanly with zero unnecessary libraries or complex abstractions, making every single line of code explainable for college project evaluation and viva examinations.

---

## 1. Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                                  BROWSER                                      |
|                                                                               |
|  [React 18 SPA] (Vite, React Router v6, Axios, Pure App.css)                  |
|  Runs on: http://localhost:5173                                               |
|                                                                               |
|  Pages:                                                                       |
|  - Home (Search & Room Cards)      - Login & Register                         |
|  - RoomDetails (Contact & Request) - Add / Edit Room                          |
|  - My Listings                     - My Requests (Sent / Received tabs)       |
|  - Profile                                                                    |
+-------------------------------------------------------------------------------+
                                      |
                          HTTP / REST API (JSON)
                      Sends Header: X-User-Id: <id>
                                      v
+-------------------------------------------------------------------------------+
|                            SPRING BOOT 3.x BACKEND                            |
|                            Runs on: http://localhost:8080                     |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | Controller Layer                                                        |  |
|  | - UserController, RoomController, RequestController                     |  |
|  | - Handles HTTP, reads X-User-Id & request body, returns ResponseEntity  |  |
|  | - NO business logic                                                     |  |
|  +-------------------------------------------------------------------------+  |
|                                      |                                        |
|  +-------------------------------------------------------------------------+  |
|  | Service Layer                                                           |  |
|  | - UserService, RoomService, RequestService                              |  |
|  | - Validations, ownership checks, business rules, throws ApiException    |  |
|  +-------------------------------------------------------------------------+  |
|                                      |                                        |
|  +-------------------------------------------------------------------------+  |
|  | Repository Layer (Spring Data JPA / Hibernate)                          |  |
|  | - UserRepository, RoomRepository, RequestRepository                     |  |
|  | - Custom JPQL queries and database mapping                              |  |
|  +-------------------------------------------------------------------------+  |
|                                      |                                        |
|  +-------------------------------------------------------------------------+  |
|  | Security & Exception Handlers                                           |  |
|  | - BCryptPasswordEncoder (spring-security-crypto only)                   |  |
|  | - GlobalExceptionHandler (@RestControllerAdvice -> {"message": "..."})   |  |
|  | - CorsConfig (allows origin http://localhost:5173)                      |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                      |
                              JDBC Connection
                                      v
+-------------------------------------------------------------------------------+
|                               DATABASE                                        |
|                                                                               |
|  Embedded H2 Database (File persistent: ./data/roommate_db)                   |
|  (Can also be switched to MySQL 8 via application.properties)                 |
+-------------------------------------------------------------------------------+
```

---

## 2. Entity-Relationship (ER) Diagram

```
+---------------------------------+             +----------------------------------+
|           USER                  | 1         * |              ROOM                |
+---------------------------------+-------------+----------------------------------+
| PK  id                  BIGINT  |             | PK  id                   BIGINT  |
|     name                VARCHAR |             |     title                VARCHAR |
|     email (UNIQUE)      VARCHAR |             |     location             VARCHAR |
|     password (WRITE_ONLY)VARCHAR|             |     rent                 INT     |
|     organization_name   VARCHAR |             |     room_type            VARCHAR |
|     location            VARCHAR |             |     description          VARCHAR |
|     preferred_location  VARCHAR |             |     available_from       DATE    |
|     budget              INT     |             |     contact              VARCHAR |
+---------------------------------+             | FK  owner_id (-> users)  BIGINT  |
         | 1                                    +----------------------------------+
         |                                                       | 1
         |                                                       |
         | *                                                     | *
+----------------------------------------------------------------------------------+
|                                ROOM_REQUEST                                      |
+----------------------------------------------------------------------------------+
| PK  id                                BIGINT                                     |
| FK  room_id (-> rooms)                BIGINT                                     |
| FK  user_id (-> users)                BIGINT                                     |
|     status (PENDING, ACCEPTED, REJECTED) VARCHAR                                 |
|                                                                                  |
| UNIQUE CONSTRAINT: (room_id, user_id) - A user cannot request a room twice       |
+----------------------------------------------------------------------------------+
```

---

## 3. Prerequisites

- **Java Development Kit (JDK)**: Version 17 or higher (compatible with Java 17 to 25)
- **Apache Maven**: Version 3.8 or higher
- **Node.js**: Version 18 or higher (with npm)
- **Database**: 
  - Default: Embedded file-persistent H2 database (`./data/roommate_db`), requires zero setup or external installation.
  - Optional: MySQL 8 (database name: `roommate_db`).

---

## 4. How to Configure the Database

### Option A: Embedded H2 Database (Default - Ready to Run)
No setup required! Spring Boot creates and manages the database file in `./data/roommate_db` with `ddl-auto=update`. You can inspect the database tables live at:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/roommate_db`
- Username: `sa`
- Password: *(leave blank)*

### Option B: MySQL 8 Database
1. Open MySQL Command Line or Workbench:
   ```sql
   CREATE DATABASE roommate_db;
   ```
2. Open `roommate-backend/src/main/resources/application.properties` and configure:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/roommate_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   server.port=8080
   ```

---

## 5. How to Run the Application

### 1. Run the Backend (Spring Boot)
Open a terminal in the `roommate-backend` directory:
```bash
cd roommate-backend
mvn spring-boot:run
```
The backend starts on `http://localhost:8080`.

### 2. Run the Frontend (Vite + React)
Open a second terminal in the `roommate-frontend` directory:
```bash
cd roommate-frontend
npm install
npm run dev
```
The frontend is available on `http://localhost:5173`.

---

## 6. REST API Contract Table

| Method | Endpoint | Access | Header | Request Body | Description & Status Codes |
|---|---|---|---|---|---|
| `POST` | `/api/users/register` | Public | None | User JSON | Registers a new user. Checks unique email (409). Hashes password with BCrypt. Returns 201 Created (no password). |
| `POST` | `/api/users/login` | Public | None | `{"email", "password"}` | Validates credentials with BCrypt. Returns 200 OK with user (no password) or 401 Unauthorized. |
| `GET` | `/api/rooms` | Public | None | None | Filters by `location`, `maxRent`, `roomType` (all optional). Uses single JPQL query. Returns 200 OK. |
| `GET` | `/api/rooms/{id}` | Public | None | None | Returns room details with owner. 200 OK or 404 Not Found. |
| `GET` | `/api/users/{id}` | Protected | `X-User-Id` | None | Returns user profile. Only accessible if `id == X-User-Id` (403 otherwise). |
| `PUT` | `/api/users/{id}` | Protected | `X-User-Id` | User JSON | Updates name, org, locations, budget. (Email & password protected). Returns 200 OK. |
| `GET` | `/api/rooms/my` | Protected | `X-User-Id` | None | Returns rooms posted by current user, newest first. |
| `POST` | `/api/rooms` | Protected | `X-User-Id` | Room JSON | Creates new room listing with owner set from `X-User-Id`. Returns 201 Created. |
| `PUT` | `/api/rooms/{id}` | Protected | `X-User-Id` | Room JSON | Updates room. Only room owner allowed (403 otherwise). Returns 200 OK. |
| `DELETE`| `/api/rooms/{id}` | Protected | `X-User-Id` | None | Deletes room and cascades deletion of requests first. Only owner allowed (403). Returns 204 No Content. |
| `POST` | `/api/requests` | Protected | `X-User-Id` | `{"roomId": 1}` | Submits inquiry. Cannot request own room (400) or duplicate (409). Returns 201 Created with PENDING status. |
| `GET` | `/api/requests/sent` | Protected | `X-User-Id` | None | Returns inquiries sent by current user. |
| `GET` | `/api/requests/received` | Protected | `X-User-Id` | None | Returns inquiries received for rooms owned by current user. |
| `PUT` | `/api/requests/{id}/accept`| Protected | `X-User-Id` | None | Room owner accepts request. Must be PENDING (409 if already decided). Returns 200 OK. |
| `PUT` | `/api/requests/{id}/reject`| Protected | `X-User-Id` | None | Room owner rejects request. Must be PENDING (409 if already decided). Returns 200 OK. |

---

## 7. Design Decisions

1. **Simplified Authentication for College Viva**:
   - Instead of complex JWT filter chains, OAuth, or session stores, the system uses an explainable tokenless authentication scheme.
   - On successful login, the client receives the user object (without password) and stores it in `localStorage`.
   - Subsequent authenticated requests attach `X-User-Id: <id>`.
   - Every service validates ownership and identity against the database using `X-User-Id`.
   - Passwords are encrypted using standard `BCryptPasswordEncoder` and annotated with `@JsonProperty(access = WRITE_ONLY)` to guarantee they are never serialized in API responses.

2. **No `@OneToMany` Lists on Entities**:
   - To avoid circular reference recursion during JSON serialization and eliminate lazy-initialization issues, bidirectional collections were omitted.
   - Entities only use `@ManyToOne` references. Child records (e.g. rooms by owner, requests by room) are fetched cleanly through repository methods.

3. **Database Flexibility**:
   - Per requirements ("USE ANY OTHER DATABASE"), an embedded file-persistent H2 database is configured by default for zero-setup, foolproof execution on any machine without needing MySQL service administration.
   - MySQL connector and properties are fully provided in `application.properties` and pom.xml so the app can be toggled to MySQL 8 with a single comment toggle.

4. **Single Cascading Delete in RoomService**:
   - `RoomService.deleteRoom` explicitly calls `requestRepository.deleteByRoomId(roomId)` inside a `@Transactional` block before deleting the room, ensuring referential integrity without database foreign key errors.

5. **Single CSS Design System**:
   - The entire frontend uses pure Vanilla CSS (`App.css`) with CSS custom properties (variables) for theme tokens. No heavy frameworks (Tailwind, Bootstrap) are used, making every style rule easily inspectable and editable.

---

## 8. Sample cURL Commands

### 1. Register a New User
```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Likhith",
    "email": "likhith@example.com",
    "password": "secretPassword1",
    "organizationName": "NMIT Bangalore",
    "location": "Bangalore",
    "preferredLocation": "Koramangala",
    "budget": 9000
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "likhith@example.com",
    "password": "secretPassword1"
  }'
```

### 3. Search Rooms with Filters
```bash
curl -X GET "http://localhost:8080/api/rooms?location=Bangalore&maxRent=10000&roomType=SHARED"
```

### 4. Post a New Room (Protected)
```bash
curl -X POST http://localhost:8080/api/rooms \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "title": "Spacious Shared Room near Metro",
    "location": "Koramangala 4th Block, Bangalore",
    "rent": 8000,
    "roomType": "SHARED",
    "description": "Fully furnished near metro station with high speed WiFi",
    "availableFrom": "2026-11-01",
    "contact": "9876543210"
  }'
```

### 5. Send a Room Request (Protected)
```bash
curl -X POST http://localhost:8080/api/requests \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 2" \
  -d '{
    "roomId": 1
  }'
```

---

## 9. Verification & Acceptance Checklist Results

| # | Acceptance Test Case | Status |
|---|---|---|
| 1 | Register two users A and B. Registering duplicate email returns 409 Conflict. | **PASSED** |
| 2 | Login fails with wrong password (401 Unauthorized) and succeeds with right password (200 OK). | **PASSED** |
| 3 | User A adds a room. It immediately appears in A's My Listings and on the Home page. | **PASSED** |
| 4 | Home filters work independently and combined (location only, budget only, type only, all three). | **PASSED** |
| 5 | User B views room details, sees contact info, and clicks Request Room. Status shows PENDING. | **PASSED** |
| 6 | User B cannot request the room twice (409 Conflict). User A cannot request their own room (400 Bad Request). | **PASSED** |
| 7 | User A views request under Received and clicks Accept. User B sees status updated to ACCEPTED under Sent. | **PASSED** |
| 8 | User B cannot edit or delete User A's room (403 Forbidden). | **PASSED** |
| 9 | User A edits the room (changes update). User A deletes the room (room and associated requests deleted). | **PASSED** |
| 10| No API response anywhere contains the user password field. | **PASSED** |
