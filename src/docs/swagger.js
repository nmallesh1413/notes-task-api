const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Notes/Task API",
    version: "1.0.0",
    description: "REST API for user accounts and personal notes/tasks.",
  },
  servers: [{ url: "http://localhost:5000", description: "Local development server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      NoteInput: {
        type: "object",
        required: ["title", "description"],
        properties: {
          title: { type: "string", example: "Learn Node.js" },
          description: { type: "string", example: "Build a REST API" },
          status: { type: "string", enum: ["pending", "in-progress", "completed"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
    },
  },
  paths: {
    "/": { get: { summary: "API welcome and health check", responses: { "200": { description: "API is running" } } } },
    "/api/auth/register": {
      post: {
        summary: "Register a user",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["name", "email", "password"],
          properties: { name: { type: "string" }, email: { type: "string", format: "email" }, password: { type: "string", minLength: 8 } },
        } } } },
        responses: { "201": { description: "Account created" }, "400": { description: "Validation error" }, "409": { description: "Email already registered" } },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login and receive a JWT",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["email", "password"],
          properties: { email: { type: "string" }, password: { type: "string" } },
        } } } },
        responses: { "200": { description: "Login successful" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/notes": {
      get: {
        summary: "List the authenticated user's notes",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "status", schema: { type: "string", enum: ["pending", "in-progress", "completed"] } },
          { in: "query", name: "priority", schema: { type: "string", enum: ["low", "medium", "high"] } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "sortBy", schema: { type: "string", enum: ["createdAt", "updatedAt", "title", "dueDate", "priority", "status"] } },
          { in: "query", name: "order", schema: { type: "string", enum: ["asc", "desc"] } },
          { in: "query", name: "page", schema: { type: "integer", minimum: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", minimum: 1, maximum: 100 } },
        ],
        responses: { "200": { description: "Notes returned" }, "401": { description: "Unauthorized" } },
      },
      post: {
        summary: "Create a note",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NoteInput" } } } },
        responses: { "201": { description: "Note created" }, "400": { description: "Validation error" } },
      },
    },
    "/api/notes/{id}": {
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
      get: { summary: "Get one note", security: [{ bearerAuth: [] }], responses: { "200": { description: "Note returned" }, "404": { description: "Not found" } } },
      put: {
        summary: "Update a note",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NoteInput" } } } },
        responses: { "200": { description: "Note updated" }, "400": { description: "Validation error" }, "404": { description: "Not found" } },
      },
      delete: { summary: "Delete a note", security: [{ bearerAuth: [] }], responses: { "200": { description: "Note deleted" }, "404": { description: "Not found" } } },
    },
    "/api/health": { get: { summary: "Check API and database status", responses: { "200": { description: "Health status" } } } },
  },
};

module.exports = swaggerSpec;
