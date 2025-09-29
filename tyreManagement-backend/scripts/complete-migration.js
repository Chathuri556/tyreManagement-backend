/**
 * Complete Database Migration Script for Tyre Management System
 * Creates all required tables for the application to work properly
 * Designed to work with Railway's hosted MySQL database
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function createAllTables() {
  let connection;

  try {
    console.log('🚀 Starting complete database migration...');
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

    // 1. Create users table
    console.log('📋 Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        azure_id VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        role VARCHAR(50),
        costCentre VARCHAR(100),
        department VARCHAR(100),
        INDEX idx_email (email),
        INDEX idx_azure_id (azure_id)
      )
    `);
    console.log('✅ users table created successfully');

    // 2. Create vehicles table
    console.log('📋 Creating vehicles table...');
    await connection.execute(`
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
    `);
    console.log('✅ vehicles table created successfully');

    // 3. Create supplier table
    console.log('📋 Creating supplier table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS supplier (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        formsfree_key VARCHAR(100) NOT NULL,
        INDEX idx_supplier_email (email),
        INDEX idx_supplier_name (name)
      )
    `);
    console.log('✅ supplier table created successfully');

    // 4. Create requests table
    console.log('📋 Creating requests table...');
    await connection.execute(`
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
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
        FOREIGN KEY (supervisorId) REFERENCES users(id),
        FOREIGN KEY (technical_manager_id) REFERENCES users(id),
        FOREIGN KEY (supervisor_decision_by) REFERENCES users(id),
        FOREIGN KEY (engineer_decision_by) REFERENCES users(id),
        FOREIGN KEY (customer_officer_decision_by) REFERENCES users(id)
      )
    `);
    console.log('✅ requests table created successfully');

    // 5. Create request_images table
    console.log('📋 Creating request_images table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS request_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requestId INT NOT NULL,
        imagePath TEXT NOT NULL,
        imageIndex INT NOT NULL,
        INDEX idx_request_id (requestId),
        INDEX idx_image_index (imageIndex),
        FOREIGN KEY (requestId) REFERENCES requests(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ request_images table created successfully');

    // 6. Create requestbackup table
    console.log('📋 Creating requestbackup table...');
    await connection.execute(`
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
        deletedByRole VARCHAR(50),
        INDEX idx_deleted_at (deletedAt),
        INDEX idx_original_id (id),
        INDEX idx_vehicle_number (vehicleNumber),
        INDEX idx_user_id (userId)
      )
    `);
    console.log('✅ requestbackup table created successfully');

    // 7. Create request_images_backup table
    console.log('📋 Creating request_images_backup table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS request_images_backup (
        id INT PRIMARY KEY,
        requestId INT NOT NULL,
        imagePath TEXT NOT NULL,
        imageIndex INT NOT NULL,
        deletedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_backup_request_id (requestId),
        INDEX idx_backup_deleted_at (deletedAt)
      )
    `);
    console.log('✅ request_images_backup table created successfully');

    console.log('🎉 All tables created successfully!');
    console.log('');
    console.log('📊 Summary of created tables:');
    console.log('   • users - User accounts and authentication');
    console.log('   • vehicles - Vehicle registration and management');
    console.log('   • supplier - Supplier information and FormsFree keys');
    console.log('   • requests - Main tire request tracking');
    console.log('   • request_images - Images attached to requests');
    console.log('   • requestbackup - Backup of deleted requests');
    console.log('   • request_images_backup - Backup of deleted request images');
    console.log('');
    console.log('🚀 Database is now ready for the application!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

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

// Run migration if this file is executed directly
if (require.main === module) {
  createAllTables()
    .then(() => {
      console.log('🎉 Complete database migration finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createAllTables };
