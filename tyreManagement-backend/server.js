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
const { sequelize, pool } = require("./config/db"); // Correct import
const { autoMigrate } = require("./scripts/auto-migrate-on-start"); // Auto migration for Railway
const { initializeRailwayDatabase } = require("./scripts/railway-init-database"); // Database initialization for Railway
require("./models"); // Loads all models and associations
// const requestRoutes = require("./routes/requestRoutes"); // Removed - routes handled in app.js
// const vehicleRoutes = require("./routes/vehicleRoutes"); // Removed - routes handled in app.js
// const sseRoutes = require("./routes/sseRoutes"); // Disabled
// const websocketService = require("./services/websocketService"); // Disabled
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

// Routes are already defined in app.js, no need to mount them again here
// app.use("/api", requestRoutes); // Removed - already mounted in app.js
// app.use("/api", vehicleRoutes); // Removed - already mounted in app.js
// app.use("/api/sse", sseRoutes); // Disabled

// Create HTTP server
const server = http.createServer(app);

// WebSocket disabled for Railway compatibility
// websocketService.initialize(server);

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
  console.log(`WebSocket server initialized`);

  // Initialize database after server starts
  initializeDatabase();
});

// Initialize database function
async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Test database connection
    await testDbConnection();

    // Initialize all database tables first (this will create the missing 'requests' table)
    console.log("Running comprehensive database initialization for Railway...");
    await initializeRailwayDatabase();
    console.log("✅ Database tables initialized successfully");

    // Run auto-migration for Railway deployment (backup table creation)
    console.log("Running auto-migration for soft delete functionality...");
    const migrationResult = await autoMigrate();
    if (migrationResult.success) {
      console.log("✅ Migration check completed:", migrationResult.message);
    } else {
      console.log("⚠️  Migration warning:", migrationResult.message);
    }

    // Sync models (this should now work since tables exist)
    try {
      await sequelize.sync({ alter: false }); // Use alter: false since we created tables manually
      console.log("✅ Sequelize models synced with existing tables!");
    } catch (syncError) {
      console.log("⚠️  Sequelize sync warning:", syncError.message);
      console.log("Tables were created manually, continuing...");
    }
    
    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    // Don't exit the process - server can still handle health checks
    console.log("⚠️  Server will continue running, but database functionality may be limited...");
  }
}
