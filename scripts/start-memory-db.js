const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("child_process");

(async () => {
  try {
    const mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    console.log(`MongoMemoryServer started: ${uri}`);

    const child = spawn("node", ["server.js"], {
      shell: true,
      stdio: "inherit",
      env: {
        ...process.env,
        MONGO_URI: uri,
        PORT: process.env.PORT || "5000",
      },
    });

    child.on("exit", (code) => {
      console.log(`Server exited with code ${code ?? 0}`);
      process.exit(code ?? 0);
    });

    child.on("error", (error) => {
      console.error("Failed to start server:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start in-memory MongoDB:", error);
    process.exit(1);
  }
})();

