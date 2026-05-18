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

async function cleanupCreatedUser(email) {
  try {
    const login = await request("/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || "LKMALLSHOP@GMAIL.COM",
        password: process.env.ADMIN_PASSWORD || "Admin@12345",
      }),
    });
    const dashboard = await request("/admin/dashboard", {
      headers: { Authorization: `Bearer ${login.data.token}` },
    });
    const created = dashboard.data.users.find((user) => user.email === email);
    if (created) {
      await request(`/admin/website-users/${created.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${login.data.token}` },
      });
    }
  } catch (error) {
    console.warn(`Cleanup skipped: ${error.message}`);
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
  const code = register.data?.devOtp;
  if (!code) {
    throw new Error("Signup smoke test requires development verification code. Ensure NODE_ENV is not production and email delivery is not configured in CI.");
  }

  await request("/auth/register/verify", {
    method: "POST",
    body: JSON.stringify({ email: testUser.email, code }),
  });

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

  await cleanupCreatedUser(testUser.email);
  console.log("API smoke tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
