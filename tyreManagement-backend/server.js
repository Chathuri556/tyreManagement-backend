require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
  console.log("Server will start but database functionality may not work.");
}

const app = require("./app");
const { sequelize, pool } = require("./config/db");
const { createAllTables } = require("./scripts/auto-migrate-all-tables");
require("./models");

const http = require("http");

const port = process.env.PORT || 5000;

// Import models so they are registered
require("./models/User");
require("./models/Vehicle");
require("./models/Request");
require("./models/RequestImage");
require("./models/TireDetails");
require("./models/Supplier");
require("./models/RequestBackup");

// Test database connection
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("MySQL pool connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the MySQL pool:", error);
    throw error; // Let the caller handle the error
  }
}

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);

  // Initialize database after server starts
  initializeDatabase();
});

// Initialize database function
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Test database connection
    await testDbConnection();

    // Run comprehensive auto-migration for all tables
    console.log("Running comprehensive auto-migration for all tables...");
    const migrationResult = await createAllTables();
    if (migrationResult.success) {
      console.log("✅ Migration completed:", migrationResult.message);
    } else {
      console.log("⚠️  Migration warning:", migrationResult.message);
    }

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Database & tables synced!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Don't exit the process - server can still handle health checks
    console.log("Server will continue running without database...");
  }
}
