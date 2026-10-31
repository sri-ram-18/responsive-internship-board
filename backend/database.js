
const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Create the SQLite database file
const db = new Database(path.join(__dirname, "internships.db"));

// Create the internships table
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
  )
`);

// Load the supplied sample JSON
const seedPath = path.join(
  __dirname,
  "data",
  "internship-records-sample.json"
);

const seedData = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const internships = Array.isArray(seedData)
  ? seedData
  : seedData.internships;

// Insert sample records only when the table is empty
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
