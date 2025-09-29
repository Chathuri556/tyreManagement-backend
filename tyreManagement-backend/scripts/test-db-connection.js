/**
 * Simple Database Connection Test
 * This script tests if the database connection works
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Connected to database successfully');
    
    // Test basic query
    const [result] = await connection.query('SELECT 1 as test');
    console.log('✅ Query test successful:', result[0]);
    
    // Check existing tables
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? 
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );
    
    console.log('📋 Existing tables:');
    if (tables.length === 0) {
      console.log('   (No tables found - database is empty)');
    } else {
      tables.forEach(table => {
        console.log(`   • ${table.TABLE_NAME}`);
      });
    }
    
    return { success: true, tableCount: tables.length };
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔚 Connection closed');
    }
  }
}

if (require.main === module) {
  testConnection()
    .then((result) => {
      if (result.success) {
        console.log('🎉 Database connection test passed!');
        process.exit(0);
      } else {
        console.log('💥 Database connection test failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Test error:', error.message);
      process.exit(1);
    });
}

module.exports = { testConnection };