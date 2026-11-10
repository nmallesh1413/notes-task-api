const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongo;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_secret_for_notes_task_api";
  process.env.NODE_ENV = "test";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = require("../src/app");
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

async function createUserAndToken(email = "student@example.com") {
  const response = await request(app).post("/api/auth/register").send({
    name: "Test Student",
    email,
    password: "password123",
  });
  return response.body.data.token;
}

describe("Notes/Task API", () => {
  test("registers and logs in a user", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test Student", email: "one@example.com", password: "password123",
    }).expect(201);

    await request(app).post("/api/auth/login").send({
      email: "one@example.com", password: "password123",
    }).expect(200);
  });

  test("requires authentication for notes", async () => {
    await request(app).get("/api/notes").expect(401);
  });

  test("creates and lists notes for the logged-in user", async () => {
    const token = await createUserAndToken();
    await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Learn Express", description: "Build an API", priority: "high" })
      .expect(201);

    const response = await request(app)
      .get("/api/notes?status=pending&page=1&limit=5")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body.count).toBe(1);
    expect(response.body.data[0].title).toBe("Learn Express");
  });

  test("rejects invalid note input", async () => {
    const token = await createUserAndToken();
    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "x", description: "" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test("prevents one user from reading another user's note", async () => {
    const tokenA = await createUserAndToken("a@example.com");
    const tokenB = await createUserAndToken("b@example.com");

    const created = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "Private note", description: "Only user A" })
      .expect(201);

    await request(app)
      .get(`/api/notes/${created.body.data._id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(404);
  });
});
