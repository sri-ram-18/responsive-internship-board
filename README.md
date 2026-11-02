# Internship Board

A responsive full-stack internship portal built with HTML, CSS, JavaScript, Node.js, Express and SQLite. Users can browse opportunities, search and filter listings, and submit internship applications.

## Project links

- **GitHub repository:** https://github.com/sri-ram-18/responsive-internship-board
- **Frontend preview:** https://responsive-internship-sriram.netlify.app/

> The Netlify URL is a frontend preview. The browser currently defaults to a local API at `http://localhost:3000`; a public backend deployment and its URL must be configured before the live preview can accept applications from other devices.

## Features

- Internship listing API backed by SQLite.
- Search by title, domain, location and skills.
- Filter by domain and work mode.
- Loading, failure/retry and empty-result states.
- Application form with browser and server validation.
- Duplicate application prevention per internship and normalized email.
- Safe HTTPS-only portfolio URL validation.
- Responsive layout and keyboard-visible focus states.
- Health endpoint that checks database connectivity.
- Request logs containing method, path, status and duration, without logging applicant records.
- Smoke tests for health, listing, not-found and application validation responses.

## Technology

- Frontend: semantic HTML5, CSS3, vanilla JavaScript.
- Backend: Node.js, Express 5.
- Database: SQLite through better-sqlite3.
- Security middleware: Helmet, CORS allow-list and express-rate-limit.

## Project structure

```text
.
├── index.html
├── style.css
├── script.js
└── backend/
    ├── data/
    │   └── internship-records-sample.json
    ├── database.js
    ├── server.js
    ├── smoke-test.js
    ├── package.json
    └── .env.example
```

## Run locally

### Requirements

- Node.js 20 or later.
- npm.
- VS Code with the Live Server extension (or another static HTTP server).

### Backend

```bash
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:3000`.

Check backend and database health at `http://localhost:3000/health`. A healthy response includes `"status": "healthy"` and `"database": "connected"`.

### Frontend

Open the repository's `index.html` with VS Code Live Server. The default local API base URL is `http://localhost:3000`.

## Environment configuration

The backend reads:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `FRONTEND_ORIGINS` | Comma-separated allowed browser origins | Local Live Server and the Netlify preview |

Example:

```env
PORT=3000
FRONTEND_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
```

For production, set `FRONTEND_ORIGINS` to the exact deployed frontend origin(s). Do not include trailing paths.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Process and database health |
| GET | `/api/internships` | List internships; supports `page` and `limit` |
| GET | `/api/internships/:id` | Get one internship |
| POST | `/api/internships` | Create an internship |
| PUT | `/api/internships/:id` | Replace an internship |
| DELETE | `/api/internships/:id` | Delete an internship |
| POST | `/api/applications` | Submit an application |

## Data model

### internships

- `id` — text primary key.
- `title`, `domain`, `mode`, `location` — required text.
- `skills` — JSON-encoded text array.
- `openings` — non-negative integer.
- `created_at`, `updated_at` — timestamps.

### applications

- `id` — text primary key.
- `internship_id` — foreign key to `internships.id`.
- `name`, `email` — required applicant fields.
- `portfolio_url` — optional HTTPS URL.
- `created_at` — timestamp.
- Unique constraint on `(internship_id, email)` prevents duplicate applications for the same role.

The database and sample internship records are initialized by `backend/database.js`. The SQLite database file is local runtime data and should not be committed.

## Engineering decisions

- **Parameterized SQL:** user-supplied values are passed as SQL parameters to avoid SQL injection.
- **Server-side validation:** client validation improves usability, while the API remains the authority.
- **Normalized email:** email is trimmed and lowercased before the uniqueness check.
- **Duplicate protection:** a database unique constraint is the final source of truth, including concurrent requests.
- **Safe portfolio links:** only HTTPS URLs without embedded credentials are accepted.
- **Rate limiting:** general API traffic and application submissions have separate limits.
- **Security headers:** Helmet applies common HTTP security headers.
- **CORS allow-list:** only configured frontend origins can call the API from browsers.
- **Privacy-aware logs:** request bodies, names, emails and portfolio URLs are not written to request logs.
- **Health endpoint:** checks database connectivity, not just whether the Node process is running.

## Verification

Start the backend, then in a second terminal run:

```bash
cd backend
npm run check
npm run test:smoke
```

The smoke suite checks:
- Health and database connectivity.
- Internship listing and pagination response shape.
- Unknown internship returns HTTP 404.
- Missing application fields return HTTP 400.
- An HTTP portfolio URL is rejected with HTTP 400.

Before release, also perform these manual checks and record the actual results:

- [ ] Submit a valid application and confirm the success message.
- [ ] Submit the same email for the same internship and confirm HTTP 409.
- [ ] Keyboard-test all fields and buttons without a mouse.
- [ ] Check at 360px viewport width and confirm no horizontal overflow.
- [ ] Run Lighthouse or axe for accessibility and performance.
- [ ] Run `npm audit` and review all reported vulnerabilities.
- [ ] Verify the deployed frontend against the deployed backend, not localhost.

## Security notes

- Never commit secrets, access tokens, production credentials or the local SQLite database.
- Configure allowed frontend origins through `FRONTEND_ORIGINS`.
- Use HTTPS for public deployments.
- Review `npm audit` output and update dependencies deliberately; avoid force-upgrading dependencies without checking breaking changes.

## Author

Sri Ram
