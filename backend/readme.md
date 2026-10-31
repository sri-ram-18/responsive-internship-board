# Internship REST API

A Node.js and Express REST API for managing internship records, using SQLite for persistent data storage.

## Technologies
- Node.js
- Express.js
- SQLite
- better-sqlite3

## Features
- Create, read, update and delete internship records.
- Retrieve individual internships by ID.
- Pagination for listing internships.
- Input validation with consistent error responses.
- Persistent storage using SQLite.
- Automatic sample data seeding.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/internships` | Get all internships |
| GET | `/api/internships/:id` | Get internship by ID |
| POST | `/api/internships` | Create an internship |
| PUT | `/api/internships/:id` | Update an internship |
| DELETE | `/api/internships/:id` | Delete an internship |

## Internship Data Model

Each internship contains:
- `id`: Unique identifier
- `title`: Internship title
- `domain`: Internship domain
- `mode`: Work mode
- `location`: Location
- `skills`: Array of required skills
- `openings`: Number of available openings
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Pagination

Example:

`GET /api/internships?page=1&limit=2`

The response includes pagination information such as current page, limit, total records and total pages.

## Validation and Error Handling

The API validates required fields and data types. Invalid requests return HTTP 400 with descriptive error details. Missing records return HTTP 404.

## Run Locally

1. Open the backend folder.
2. Install dependencies:

   `npm install`

3. Start the development server:

   `npm run dev`

4. Access the API:

   `http://localhost:3000/api/internships`

## Database

SQLite stores internship records in `internships.db`. Sample records are automatically inserted when the database is first initialized.