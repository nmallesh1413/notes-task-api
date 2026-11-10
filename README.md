# Notes/Task API

A complete student backend project using **Node.js, Express, MongoDB and Mongoose**. It includes CRUD, validation, centralized errors, filtering, sorting, pagination, JWT authentication, per-user data ownership, rate limiting, security headers, request logging, Swagger documentation and automated tests.

## Requirements

- Node.js 18+
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas database
- VS Code
- Postman (optional, for manual API testing)

## 1. Open and install

1. Extract `notes-task-api.zip`.
2. Open the extracted `notes-task-api` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
```

5. Copy `.env.example` to a new file named `.env`.
6. Set `MONGO_URI` to your local MongoDB URL or Atlas connection string.
7. Change `JWT_SECRET` to a long, random secret. Do not share or commit `.env`.

Example local `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/notes_task_db
JWT_SECRET=put_a_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## 2. Start MongoDB

If you use MongoDB Community Server, make sure its service is running before starting the API. If you use Atlas, configure the connection string and allow your IP address in Atlas Network Access.

## 3. Run the API

```bash
npm run dev
```

Open:
- API health: http://localhost:5000/
- Database health: http://localhost:5000/api/health
- Swagger docs: http://localhost:5000/api-docs

## 4. Test in Postman

Base URL: `http://localhost:5000`

### Register

`POST /api/auth/register`

```json
{
  "name": "Mallesh",
  "email": "mallesh@example.com",
  "password": "password123"
}
```

Copy `data.token` from the response.

### Login

`POST /api/auth/login`

```json
{
  "email": "mallesh@example.com",
  "password": "password123"
}
```

### Authenticate note requests

For every `/api/notes` request, add this header:

```text
Authorization: Bearer YOUR_TOKEN
```

### Create a note

`POST /api/notes`

```json
{
  "title": "Learn Node.js",
  "description": "Build a Notes REST API",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-12-01T10:00:00.000Z"
}
```

### List notes

`GET /api/notes`

Query examples:

```text
/api/notes?status=pending
/api/notes?priority=high
/api/notes?search=node
/api/notes?sortBy=createdAt&order=desc
/api/notes?page=1&limit=5
/api/notes?status=pending&priority=high&sortBy=createdAt&order=desc&page=1&limit=5
```

Allowed values:
- status: `pending`, `in-progress`, `completed`
- priority: `low`, `medium`, `high`
- order: `asc`, `desc`
- sortBy: `createdAt`, `updatedAt`, `title`, `dueDate`, `priority`, `status`
- page: positive integer
- limit: 1–100

### Get one note

`GET /api/notes/NOTE_ID`

### Update a note

`PUT /api/notes/NOTE_ID`

```json
{
  "title": "Learn Advanced Node.js",
  "status": "in-progress"
}
```

### Delete a note

`DELETE /api/notes/NOTE_ID`

## 5. Run automated tests

```bash
npm test
```

Tests use an in-memory MongoDB instance and do not require your local MongoDB service. The first run may download the MongoDB test binary.

## API route summary

| Method | Endpoint | Authentication | Purpose |
|---|---|---:|---|
| GET | `/` | No | API welcome |
| GET | `/api/health` | No | API/database status |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/notes` | Yes | Create note |
| GET | `/api/notes` | Yes | List/filter/sort/page |
| GET | `/api/notes/:id` | Yes | Read one note |
| PUT | `/api/notes/:id` | Yes | Update note |
| DELETE | `/api/notes/:id` | Yes | Delete note |

## Project structure

```text
notes-task-api/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── docs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── validators/
├── tests/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Important notes

- Notes are private to the account that created them. A user cannot read, update or delete another user's notes.
- Passwords are hashed with bcrypt before being saved.
- JWT authentication protects all note endpoints.
- Rate limiting, Helmet security headers and request logging are enabled.
- Never upload your `.env` file to GitHub.
- This is a learning project with production-oriented patterns, not a substitute for a full security review before a real public deployment.
