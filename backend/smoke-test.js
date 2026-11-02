const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

async function check(name, path, options, expectedStatus, validate) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  let body = {};

  try {
    body = await response.json();
  } catch {
    // A non-JSON response will fail the relevant assertion below.
  }

  if (response.status !== expectedStatus) {
    throw new Error(`${name}: expected HTTP ${expectedStatus}, received ${response.status}`);
  }

  if (validate && !validate(body)) {
    throw new Error(`${name}: response did not match the expected shape`);
  }

  console.log(`PASS ${name} (HTTP ${response.status})`);
}

async function main() {
  await check(
    "Health and database connectivity",
    "/health",
    undefined,
    200,
    (body) => body.status === "healthy" && body.database === "connected"
  );

  await check(
    "Internship listing",
    "/api/internships?limit=5",
    undefined,
    200,
    (body) => Array.isArray(body.data) && body.pagination?.limit === 5
  );

  await check(
    "Unknown internship returns not found",
    "/api/internships/__smoke_test_missing__",
    undefined,
    404,
    (body) => Boolean(body.error?.message)
  );

  await check(
    "Application validation rejects missing fields",
    "/api/applications",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    },
    400,
    (body) => body.error?.message === "Validation failed."
  );

  await check(
    "Application validation rejects unsafe portfolio URLs",
    "/api/applications",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        internshipId: "INT-101",
        name: "Smoke Test",
        email: "smoke-test@example.com",
        portfolioUrl: "http://example.com"
      })
    },
    400,
    (body) => body.error?.details?.includes("Portfolio URL must be a safe HTTPS URL.")
  );

  console.log("\nAll smoke checks passed.");
}

main().catch((error) => {
  console.error(`\nSmoke checks failed: ${error.message}`);
  process.exitCode = 1;
});
