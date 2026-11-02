const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/api`;

let internships = [];

const search = document.querySelector("#search");
const domain = document.querySelector("#domain");
const mode = document.querySelector("#mode");
const filtersForm = document.querySelector("#filters");
const list = document.querySelector("#internships");
const count = document.querySelector("#count");
const applicationForm = document.querySelector("#application-form");
const applicationStatus = document.querySelector("#application-status");
const applicationSubmit = document.querySelector("#application-submit");
const internshipIdInput = document.querySelector("#internship-id");

function setApplicationStatus(message, state = "") {
  applicationStatus.textContent = message;
  if (state) {
    applicationStatus.dataset.state = state;
  } else {
    delete applicationStatus.dataset.state;
  }
}

async function loadInternships() {
  list.replaceChildren();
  const loadingMessage = document.createElement("p");
  loadingMessage.textContent = "Loading internships…";
  list.appendChild(loadingMessage);
  count.textContent = "";

  try {
    const response = await fetch(`${API_URL}/internships`);

    if (!response.ok) {
      throw new Error("Unable to load internships.");
    }

    const result = await response.json();
    internships = Array.isArray(result.data) ? result.data : [];
    renderInternships();
  } catch (error) {
    list.replaceChildren();

    const message = document.createElement("p");
    message.textContent = "We couldn't load internships. Check your connection and try again.";

    const retryButton = document.createElement("button");
    retryButton.textContent = "Try again";
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

  count.textContent = `${filtered.length} internship${filtered.length === 1 ? "" : "s"} found`;
  list.replaceChildren();

  if (filtered.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = internships.length === 0
      ? "There are no internships available right now."
      : "No internships match these filters. Try changing your search.";
    list.appendChild(emptyMessage);
    return;
  }

  filtered.forEach((job) => {
    const card = document.createElement("article");
    card.className = "card";

    const domainText = document.createElement("p");
    domainText.className = "card-domain";
    domainText.textContent = job.domain;

    const title = document.createElement("h2");
    title.textContent = job.title;

    const id = document.createElement("p");
    id.textContent = `Internship ID: ${job.id}`;

    const location = document.createElement("p");
    location.textContent = `${job.mode} · ${job.location}`;

    const skills = document.createElement("p");
    skills.textContent = `Skills: ${job.skills.join(", ")}`;

    const openings = document.createElement("p");
    openings.textContent = `Openings: ${job.openings}`;

    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.textContent = "Apply for this role";
    applyButton.setAttribute("aria-label", `Apply for ${job.title}`);
    applyButton.addEventListener("click", () => {
      internshipIdInput.value = job.id;
      setApplicationStatus(`Selected: ${job.title}. Complete the form below.`);
      document.querySelector("#application-section").scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
      internshipIdInput.focus({ preventScroll: true });
    });

    card.append(domainText, title, id, location, skills, openings, applyButton);
    list.appendChild(card);
  });
}

search.addEventListener("input", renderInternships);
domain.addEventListener("change", renderInternships);
mode.addEventListener("change", renderInternships);

filtersForm.addEventListener("reset", () => {
  window.setTimeout(renderInternships, 0);
});

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!applicationForm.reportValidity()) return;

  const formData = new FormData(applicationForm);
  const application = {
    internshipId: String(formData.get("internshipId") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    portfolioUrl: String(formData.get("portfolioUrl") || "").trim()
  };

  applicationSubmit.disabled = true;
  applicationSubmit.textContent = "Submitting…";
  setApplicationStatus("Submitting your application…");

  try {
    const response = await fetch(`${API_URL}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(application)
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const details = result.error?.details?.join(" ");
      throw new Error(details || result.error?.message || "Your application could not be submitted.");
    }

    setApplicationStatus("Application submitted successfully!", "success");
    applicationForm.reset();
  } catch (error) {
    setApplicationStatus(error.message || "Something went wrong. Please try again.", "error");
  } finally {
    applicationSubmit.disabled = false;
    applicationSubmit.textContent = "Submit application";
  }
});

loadInternships();
