
const express = require("express");
const { randomUUID } = require("crypto");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Convert database rows into API response objects
function formatInternship(row) {
  if (!row) return null;

  return {
    ...row,
    skills: JSON.parse(row.skills)
  };
}

// Standard error response
function sendError(res, status, message) {
  return res.status(status).json({
    error: {
      message
    }
  });
}

// Validate internship input
function validateInternship(body, partial = false) {
  const errors = [];
  const fields = ["title", "domain", "mode", "location", "skills", "openings"];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be a JSON object."];
  }

  if (partial) {
    for (const key of Object.keys(body)) {
      if (!fields.includes(key)) {
        errors.push(`Unknown field: ${key}`);
      }
    }
  }

  for (const field of fields) {
    if (partial && !(field in body)) continue;

    const value = body[field];

    if (["title", "domain", "mode", "location"].includes(field)) {
      if (typeof value !== "string" || !value.trim()) {
        errors.push(`${field} must be a non-empty string.`);
      }
    }

    if (field === "skills") {
      if (
        !Array.isArray(value) ||
        !value.every(skill => typeof skill === "string" && skill.trim())
      ) {
        errors.push("skills must be an array of non-empty strings.");
      }
    }

    if (field === "openings") {
      if (!Number.isInteger(value) || value < 0) {
        errors.push("openings must be a non-negative integer.");
      }
    }
  }

  return errors;
}

// GET: List internships with pagination
app.get("/api/internships", (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) || page < 1 ||
    !Number.isInteger(limit) || limit < 1 || limit > 100
  ) {
    return sendError(
      res,
      400,
      "page must be >= 1 and limit must be between 1 and 100."
    );
  }

  const total = db.prepare(
    "SELECT COUNT(*) AS total FROM internships"
  ).get().total;

  const rows = db.prepare(`
    SELECT * FROM internships
    ORDER BY created_at DESC, id ASC
    LIMIT ? OFFSET ?
  `).all(limit, (page - 1) * limit);

  res.json({
    data: rows.map(formatInternship),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET: Get one internship
app.get("/api/internships/:id", (req, res) => {
  const row = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!row) {
    return sendError(res, 404, "Internship not found.");
  }

  res.json({ data: formatInternship(row) });
});

// POST: Create an internship
app.post("/api/internships", (req, res) => {
  const errors = validateInternship(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: {
        message: "Validation failed.",
        details: errors
      }
    });
  }

  const internship = {
    id: randomUUID(),
    title: req.body.title.trim(),
    domain: req.body.domain.trim(),
    mode: req.body.mode.trim(),
    location: req.body.location.trim(),
    skills: JSON.stringify(req.body.skills.map(s => s.trim())),
    openings: req.body.openings
  };

  db.prepare(`
    INSERT INTO internships
      (id, title, domain, mode, location, skills, openings)
    VALUES
      (@id, @title, @domain, @mode, @location, @skills, @openings)
  `).run(internship);

  const created = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(internship.id);

  res.status(201).json({ data: formatInternship(created) });
});

// PUT: Update an existing internship
app.put("/api/internships/:id", (req, res) => {
  const existing = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!existing) {
    return sendError(res, 404, "Internship not found.");
  }

  const errors = validateInternship(req.body);

  if (errors.length) {
    return res.status(400).json({
      error: {
        message: "Validation failed.",
        details: errors
      }
    });
  }

  db.prepare(`
    UPDATE internships
    SET title = ?, domain = ?, mode = ?, location = ?,
        skills = ?, openings = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    req.body.title.trim(),
    req.body.domain.trim(),
    req.body.mode.trim(),
    req.body.location.trim(),
    JSON.stringify(req.body.skills.map(s => s.trim())),
    req.body.openings,
    req.params.id
  );

  const updated = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  res.json({ data: formatInternship(updated) });
});

// DELETE: Delete an internship
app.delete("/api/internships/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) {
    return sendError(res, 404, "Internship not found.");
  }

  res.json({
    data: {
      message: "Internship deleted successfully."
    }
  });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, 400, "Invalid JSON request body.");
  }

  console.error(err);
  return sendError(res, 500, "Internal server error.");
});

app.listen(PORT, () => {
  console.log(`Internship API running at http://localhost:${PORT}`);
});
