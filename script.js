
const internships = [
  {
    id: "INT-101",
    title: "Frontend Intern",
    domain: "Full Stack Development",
    mode: "Remote",
    location: "India",
    skills: ["HTML", "CSS", "JavaScript"],
    openings: 3
  },
  {
    id: "INT-102",
    title: "API Engineering Intern",
    domain: "Full Stack Development",
    mode: "Hybrid",
    location: "Pune",
    skills: ["Node.js", "SQL", "Testing"],
    openings: 2
  },
  {
    id: "INT-103",
    title: "UI/UX Intern",
    domain: "UI/UX",
    mode: "Remote",
    location: "India",
    skills: ["Figma", "Research", "Accessibility"],
    openings: 1
  },
  {
    id: "INT-104",
    title: "Data Analyst Intern",
    domain: "Data Analytics",
    mode: "On-site",
    location: "Bengaluru",
    skills: ["Excel", "SQL", "Data visualisation"],
    openings: 2
  },
  {
    id: "INT-105",
    title: "Security Operations Intern",
    domain: "Cyber Security",
    mode: "Remote",
    location: "India",
    skills: ["Linux", "Logs", "Networking"],
    openings: 1
  }
];

const search = document.querySelector("#search");
const domain = document.querySelector("#domain");
const mode = document.querySelector("#mode");
const form = document.querySelector("#filters");
const list = document.querySelector("#internships");
const count = document.querySelector("#count");

function renderInternships() {
  const query = search.value.trim().toLowerCase();

  const filtered = internships.filter((job) => {
    const searchable = [
      job.title,
      job.domain,
      job.location,
      ...job.skills
    ].join(" ").toLowerCase();

    return searchable.includes(query) &&
      (!domain.value || job.domain === domain.value) &&
      (!mode.value || job.mode === mode.value);
  });

  count.textContent = `${filtered.length} internship(s) found`;

  if (filtered.length === 0) {
    list.innerHTML = "<p>No internships found. Try different filters.</p>";
    return;
  }

  list.innerHTML = filtered.map((job) => `
    <article class="card">
      <h2>${job.title}</h2>
      <p><strong>ID:</strong> ${job.id}</p>
      <p>${job.domain}</p>
      <p>${job.mode} · ${job.location}</p>
      <p><strong>Skills:</strong> ${job.skills.join(", ")}</p>
      <p><strong>Openings:</strong> ${job.openings}</p>
    </article>
  `).join("");
}

search.addEventListener("input", renderInternships);
domain.addEventListener("change", renderInternships);
mode.addEventListener("change", renderInternships);

form.addEventListener("reset", () => {
  setTimeout(renderInternships, 0);
});

renderInternships();
