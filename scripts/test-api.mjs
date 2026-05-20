const API_BASE_URL = process.env.TEST_API_URL || "http://localhost:5000/api";
const suffix = `${Date.now()}${Math.round(Math.random() * 1000)}`;
const testUser = {
  name: "CI Smoke User",
  email: `ci-smoke-${suffix}@example.com`,
  phone: `+9177${suffix.slice(-8).padStart(8, "0")}`,
  company: "HOI CI",
  password: "Password1",
};

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed with ${response.status}: ${body.message || text}`);
  }
  return body;
}

async function expectFailure(path, status, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (response.status !== status) {
    const text = await response.text();
    throw new Error(`${options.method || "GET"} ${path} expected ${status}, got ${response.status}: ${text}`);
  }
}

async function main() {
  const health = await request("/health");
  if (health.status !== "OK") throw new Error("Health check did not return OK");

  const [venues, services, packages, events] = await Promise.all([
    request("/venues"),
    request("/services"),
    request("/packages"),
    request("/events"),
  ]);
  if (!venues.data.venues.length) throw new Error("Expected seeded venues");
  if (!services.data.services.length) throw new Error("Expected seeded services");
  if (!packages.data.packages.length) throw new Error("Expected seeded packages");
  if (!events.data.events.length) throw new Error("Expected seeded events");

  const register = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(testUser),
  });
  if (!register.data?.token) throw new Error("Expected register to return an auth token");

  await expectFailure("/auth/register", 409, {
    method: "POST",
    body: JSON.stringify({ ...testUser, email: `ci-duplicate-${suffix}@example.com` }),
  });

  const login = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  const token = login.data.token;

  await request("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  await request("/inquiries", {
    method: "POST",
    body: JSON.stringify({
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      company: testUser.company,
      service: "Booth Design",
      location: "Yashobhoomi",
      message: "CI smoke test inquiry message.",
    }),
  });
  await request("/bookings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ serviceId: "booth-design", notes: "CI smoke booking" }),
  });
  const bookings = await request("/bookings", { headers: { Authorization: `Bearer ${token}` } });
  if (!bookings.data.bookings.length) throw new Error("Expected booking for smoke user");

  console.log("API smoke tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
