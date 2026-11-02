

const API_URL = "http://localhost:3000/api/internships";

let internships = [];

const search = document.querySelector("#search");
const domain = document.querySelector("#domain");
const mode = document.querySelector("#mode");
const form = document.querySelector("#filters");
const list = document.querySelector("#internships");
const count = document.querySelector("#count");

async function loadInternships() {
  list.textContent = "Loading internships...";
  count.textContent = "";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to load internships.");
    }

    const result = await response.json();
    internships = result.data;

    renderInternships();
  } catch (error) {
    list.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "Failed to load internships. Please try again.";

    const retryButton = document.createElement("button");
    retryButton.textContent = "Retry";
    retryButton.type = "button";
    retryButton.addEventListener("click", loadInternships);

    list.append(message, retryButton);
    count.textContent = "";
  }
}

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
  list.replaceChildren();

  if (filtered.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No internships found. Try different filters.";
    list.appendChild(emptyMessage);
    return;
  }

  filtered.forEach((job) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h2");
    title.textContent = job.title;

    const id = document.createElement("p");
    id.textContent = `ID: ${job.id}`;

    const domainText = document.createElement("p");
    domainText.textContent = job.domain;

    const location = document.createElement("p");
    location.textContent = `${job.mode} · ${job.location}`;

    const skills = document.createElement("p");
    skills.textContent = `Skills: ${job.skills.join(", ")}`;

    const openings = document.createElement("p");
    openings.textContent = `Openings: ${job.openings}`;

    card.append(title, id, domainText, location, skills, openings);
    list.appendChild(card);
  });
}

search.addEventListener("input", renderInternships);
domain.addEventListener("change", renderInternships);
mode.addEventListener("change", renderInternships);

form.addEventListener("reset", () => {
  setTimeout(renderInternships, 0);
});

loadInternships();
const applicationForm = document.querySelector("#application-form");
const applicationStatus = document.querySelector("#application-status");

applicationForm.addEventListener("submit", async (event) => {
  console.log("SUBMIT HANDLER WORKING");
  event.preventDefault();

  const formData = new FormData(applicationForm);

  const application = {
    internshipId: formData.get("internshipId"),
    name: formData.get("name"),
    email: formData.get("email"),
    portfolioUrl: formData.get("portfolioUrl")
  };

  applicationStatus.textContent = "Submitting...";

  try {
    const response = await fetch("http://localhost:3000/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.details?.join(" ") ||
        result.error?.message ||
        "Submission failed."
      );
    }

    applicationStatus.textContent = "Application submitted successfully!";
    applicationForm.reset();

  } catch (error) {
    applicationStatus.textContent = error.message;
  }
});
