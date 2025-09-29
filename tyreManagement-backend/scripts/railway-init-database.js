/**
 * Railway Database Initialization Script
 * This script creates all necessary tables for the tyre management system
 * Designed to work with Railway's hosted MySQL database
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeRailwayDatabase() {
  let connection;
  
  try {
    console.log('🚂 Starting Railway database initialization...');
    console.log('📡 Connecting to Railway MySQL database...');
    
    // Create connection to Railway database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: {
        rejectUnauthorized: false // Railway requires SSL but with flexible certificate validation
      }
    });
    
    console.log('✅ Connected to Railway database successfully');
    
    // Create users table
    console.log('📋 Creating users table...');
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        azure_id VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        role VARCHAR(50),
        costCentre VARCHAR(100),
        department VARCHAR(100),
        INDEX idx_azure_id (azure_id),
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `;
    await connection.execute(createUsersTableSQL);
    console.log('✅ users table created/verified');
    
    // Create vehicles table
    console.log('📋 Creating vehicles table...');
    const createVehiclesTableSQL = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        registeredBy INT NOT NULL,
        vehicleNumber VARCHAR(50) NOT NULL UNIQUE,
        make VARCHAR(50),
        model VARCHAR(50),
        type VARCHAR(50),
        status VARCHAR(20),
        cost_centre VARCHAR(100),
        department VARCHAR(100),
        INDEX idx_vehicle_number (vehicleNumber),
        INDEX idx_registered_by (registeredBy),
        FOREIGN KEY (registeredBy) REFERENCES users(id)
      )
    `;
    await connection.execute(createVehiclesTableSQL);
    console.log('✅ vehicles table created/verified');
    
    // Create requests table (the main table that was missing)
    console.log('📋 Creating requests table...');
    const createRequestsTableSQL = `
      CREATE TABLE IF NOT EXISTS requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        vehicleId INT NOT NULL,
        vehicleNumber VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        tubesQuantity INT NOT NULL,
        tireSize VARCHAR(50) NOT NULL,
        requestReason TEXT NOT NULL,
        requesterName VARCHAR(100) NOT NULL,
        requesterEmail VARCHAR(100) NOT NULL,
        requesterPhone VARCHAR(20) NOT NULL,
        vehicleBrand VARCHAR(50) NOT NULL,
        vehicleModel VARCHAR(50) NOT NULL,
        lastReplacementDate DATE NOT NULL,
        existingTireMake VARCHAR(100) NOT NULL,
        tireSizeRequired VARCHAR(50) NOT NULL,
        presentKmReading INT NOT NULL,
        previousKmReading INT NOT NULL,
        tireWearPattern VARCHAR(100) NOT NULL,
        comments TEXT,
        status ENUM(
          'pending',
          'supervisor approved',
          'technical-manager approved',
          'engineer approved',
          'Engineer Approved',
          'customer-officer approved',
          'approved',
          'rejected',
          'supervisor rejected',
          'technical-manager rejected',
          'engineer rejected',
          'customer-officer rejected',
          'complete',
          'order placed',
          'order cancelled'
        ) DEFAULT 'pending',
        submittedAt DATETIME NOT NULL,
        supervisor_notes TEXT,
        technical_manager_note TEXT,
        engineer_note TEXT,
        customer_officer_note TEXT,
        supervisorId INT NOT NULL,
        technical_manager_id INT,
        supervisor_decision_by INT,
        engineer_decision_by INT,
        customer_officer_decision_by INT,
        deliveryOfficeName VARCHAR(100),
        deliveryStreetName VARCHAR(255),
        deliveryTown VARCHAR(100),
        totalPrice DECIMAL(10, 2),
        warrantyDistance INT,
        tireWearIndicatorAppeared BOOLEAN DEFAULT FALSE,
        Department VARCHAR(100),
        CostCenter VARCHAR(100),
        supplierName VARCHAR(255),
        supplierEmail VARCHAR(255),
        supplierPhone VARCHAR(255),
        orderNumber VARCHAR(255),
        orderNotes TEXT,
        orderPlacedDate DATETIME,
        INDEX idx_user_id (userId),
        INDEX idx_vehicle_id (vehicleId),
        INDEX idx_vehicle_number (vehicleNumber),
        INDEX idx_status (status),
        INDEX idx_submitted_at (submittedAt),
        INDEX idx_supervisor_id (supervisorId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
        FOREIGN KEY (supervisorId) REFERENCES users(id),
        FOREIGN KEY (technical_manager_id) REFERENCES users(id),
        FOREIGN KEY (supervisor_decision_by) REFERENCES users(id),
        FOREIGN KEY (engineer_decision_by) REFERENCES users(id),
        FOREIGN KEY (customer_officer_decision_by) REFERENCES users(id)
      )
    `;
    await connection.execute(createRequestsTableSQL);
    console.log('✅ requests table created/verified');
    
    // Create requestbackup table for soft deletes
    console.log('📋 Creating requestbackup table...');
    const createRequestBackupTableSQL = `
      CREATE TABLE IF NOT EXISTS requestbackup (
        id INT PRIMARY KEY,
        userId INT NOT NULL,
        vehicleId INT NOT NULL,
        vehicleNumber VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        tubesQuantity INT NOT NULL,
        tireSize VARCHAR(50) NOT NULL,
        requestReason TEXT NOT NULL,
        requesterName VARCHAR(100) NOT NULL,
        requesterEmail VARCHAR(100) NOT NULL,
        requesterPhone VARCHAR(20) NOT NULL,
        vehicleBrand VARCHAR(50) NOT NULL,
        vehicleModel VARCHAR(50) NOT NULL,
        lastReplacementDate DATE NOT NULL,
        existingTireMake VARCHAR(100) NOT NULL,
        tireSizeRequired VARCHAR(50) NOT NULL,
        presentKmReading INT NOT NULL,
        previousKmReading INT NOT NULL,
        tireWearPattern VARCHAR(100) NOT NULL,
        comments TEXT,
        status ENUM(
          'pending',
          'supervisor approved',
          'technical-manager approved',
          'engineer approved',
          'Engineer Approved',
          'customer-officer approved',
          'approved',
          'rejected',
          'supervisor rejected',
          'technical-manager rejected',
          'engineer rejected',
          'customer-officer rejected',
          'complete',
          'order placed',
          'order cancelled'
        ) DEFAULT 'pending',
        submittedAt DATETIME NOT NULL,
        supervisor_notes TEXT,
        technical_manager_note TEXT,
        engineer_note TEXT,
        customer_officer_note TEXT,
        supervisorId INT NOT NULL,
        technical_manager_id INT,
        supervisor_decision_by INT,
        engineer_decision_by INT,
        customer_officer_decision_by INT,
        deliveryOfficeName VARCHAR(100),
        deliveryStreetName VARCHAR(255),
        deliveryTown VARCHAR(100),
        totalPrice DECIMAL(10, 2),
        warrantyDistance INT,
        tireWearIndicatorAppeared BOOLEAN DEFAULT FALSE,
        Department VARCHAR(100),
        CostCenter VARCHAR(100),
        supplierName VARCHAR(255),
        supplierEmail VARCHAR(255),
        supplierPhone VARCHAR(255),
        orderNumber VARCHAR(255),
        orderNotes TEXT,
        orderPlacedDate DATETIME,
        deletedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deletedBy INT,
        INDEX idx_deleted_at (deletedAt),
        INDEX idx_original_id (id),
        INDEX idx_vehicle_number (vehicleNumber)
      )
    `;
    await connection.execute(createRequestBackupTableSQL);
    console.log('✅ requestbackup table created/verified');
    
    // Create requestimages table
    console.log('📋 Creating requestimages table...');
    const createRequestImagesTableSQL = `
      CREATE TABLE IF NOT EXISTS requestimages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requestId INT NOT NULL,
        imageUrl VARCHAR(500) NOT NULL,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_request_id (requestId),
        FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createRequestImagesTableSQL);
    console.log('✅ requestimages table created/verified');
    
    // Create tiredetails table
    console.log('�� Creating tiredetails table...');
    const createTireDetailsTableSQL = `
      CREATE TABLE IF NOT EXISTS tiredetails (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requestId INT NOT NULL,
        tireSize VARCHAR(50) NOT NULL,
        tireBrand VARCHAR(100),
        tireModel VARCHAR(100),
        quantity INT NOT NULL,
        unitPrice DECIMAL(10, 2),
        totalPrice DECIMAL(10, 2),
        INDEX idx_request_id (requestId),
        FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createTireDetailsTableSQL);
    console.log('✅ tiredetails table created/verified');
    
    // Create suppliers table
    console.log('📋 Creating suppliers table...');
    const createSuppliersTableSQL = `
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(255),
        address TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_email (email)
      )
    `;
    await connection.execute(createSuppliersTableSQL);
    console.log('✅ suppliers table created/verified');
    
    // Verify all tables were created
    console.log('🔍 Verifying table creation...');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? 
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );
    
    const expectedTables = ['users', 'vehicles', 'requests', 'requestbackup', 'requestimages', 'tiredetails', 'suppliers'];
    const createdTables = tables.map(t => t.TABLE_NAME);
    
    console.log('📊 Database tables created:');
    expectedTables.forEach(table => {
      if (createdTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - MISSING`);
      }
    });
    
    console.log('');
    console.log('🎯 Database initialization completed successfully!');
    console.log('🚀 Your tyre management system is ready to use!');
    console.log('');
    console.log('📋 Available tables:');
    console.log('   • users - User accounts and roles');
    console.log('   • vehicles - Vehicle registry');
    console.log('   • requests - Tyre replacement requests');
    console.log('   • requestbackup - Soft deleted requests');
    console.log('   • requestimages - Request attachments');
    console.log('   • tiredetails - Tyre specifications');
    console.log('   • suppliers - Supplier information');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // Provide specific Railway troubleshooting
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Railway connection issue:');
      console.log('   • Check your DATABASE_URL in Railway dashboard');
      console.log('   • Ensure DB_HOST, DB_USER, DB_PASS are correct in .env');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Authentication issue:');
      console.log('   • Verify database credentials in Railway dashboard');
      console.log('   • Check DB_USER and DB_PASS environment variables');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Connection refused:');
      console.log('   • Railway database might be starting up');
      console.log('   • Check Railway service status');
    } else if (error.sqlMessage) {
      console.log('💡 SQL Error:', error.sqlMessage);
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Database connection closed');
    }
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeRailwayDatabase()
    .then(() => {
      console.log('🎉 Railway database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database initialization failed:', error.message);
      process.exit(1);
    });
}

module.exports = { initializeRailwayDatabase };