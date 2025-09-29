/**
 * Auto Migration Script for Railway Deployment
 * Creates all required database tables when the app starts
 * Perfect for Railway environment where local access isn't possible
 */

const { pool } = require('../config/db');

async function createAllTables() {
  let connection;

  try {
    console.log('🔄 [AUTO-MIGRATE] Checking for required database tables...');

    connection = await pool.getConnection();
    console.log('✅ [AUTO-MIGRATE] Connected to Railway database');

    // Check if main tables already exist
    const [existingTables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'vehicles', 'supplier', 'requests', 'request_images')`,
      [process.env.DB_NAME]
    );

    if (existingTables.length >= 5) {
      console.log('✅ [AUTO-MIGRATE] All main tables already exist - skipping migration');
      return { success: true, message: 'Tables already exist' };
    }

    console.log('📊 [AUTO-MIGRATE] Creating all required tables...');

    // 1. Create users table
    await connection.query(`
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
    console.log('✅ [AUTO-MIGRATE] users table created');

    // 2. Create vehicles table
    await connection.query(`
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
        INDEX idx_registered_by (registeredBy)
      )
    `);
    console.log('✅ [AUTO-MIGRATE] vehicles table created');

    // 3. Create supplier table
    await connection.query(`
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
    console.log('✅ [AUTO-MIGRATE] supplier table created');

    // 4. Create requests table (this is the main table that's missing)
    await connection.query(`
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
        INDEX idx_submitted_at (submittedAt)
      )
    `);
    console.log('✅ [AUTO-MIGRATE] requests table created');

    // 5. Create request_images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS request_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requestId INT NOT NULL,
        imagePath TEXT NOT NULL,
        imageIndex INT NOT NULL,
        INDEX idx_request_id (requestId),
        INDEX idx_image_index (imageIndex)
      )
    `);
    console.log('✅ [AUTO-MIGRATE] request_images table created');

    // 6. Create requestbackup table
    await connection.query(`
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
        INDEX idx_vehicle_number (vehicleNumber)
      )
    `);
    console.log('✅ [AUTO-MIGRATE] requestbackup table created');

    // 7. Create request_images_backup table
    await connection.query(`
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
    console.log('✅ [AUTO-MIGRATE] request_images_backup table created');

    console.log('🎉 [AUTO-MIGRATE] All tables created successfully!');
    console.log('🚀 [AUTO-MIGRATE] Database is now ready for the application');

    return { success: true, message: 'All tables created successfully' };

  } catch (error) {
    console.error('❌ [AUTO-MIGRATE] Migration failed:', error.message);

    // Don't crash the app if migration fails - just log the error
    console.log('⚠️  [AUTO-MIGRATE] App will continue but may have database issues');
    return { success: false, message: error.message };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = { createAllTables };
