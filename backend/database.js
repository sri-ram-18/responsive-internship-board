

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "internships.db"));

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    mode TEXT NOT NULL,
    location TEXT NOT NULL,
    skills TEXT NOT NULL,
    openings INTEGER NOT NULL CHECK (openings >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    internship_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    portfolio_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (internship_id) REFERENCES internships(id),
    UNIQUE (internship_id, email)
  );
`);

const seedPath = path.join(
  __dirname,
  "data",
  "internship-records-sample.json"
);

const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));

const internships = Array.isArray(seedData)
  ? seedData
  : seedData.internships;

const count = db.prepare(
  "SELECT COUNT(*) AS total FROM internships"
).get();

if (count.total === 0) {
  const insert = db.prepare(`
    INSERT INTO internships
      (id, title, domain, mode, location, skills, openings)
    VALUES
      (@id, @title, @domain, @mode, @location, @skills, @openings)
  `);

  const seed = db.transaction((records) => {
    for (const job of records) {
      insert.run({
        ...job,
        skills: JSON.stringify(job.skills)
      });
    }
  });

  seed(internships);
  console.log(`Seeded ${internships.length} internships.`);
}

console.log("SQLite database is ready.");

module.exports = db;
