
async function testAPI() {
  const response = await fetch(
    "http://localhost:3000/api/internships",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "",
        domain: "AI & Data Science",
        mode: "Remote",
        location: "India",
        skills: ["Python"],
        openings: -1
      })
    }
  );

  console.log("Status:", response.status);
  console.log("Response:", await response.json());
}

testAPI();
