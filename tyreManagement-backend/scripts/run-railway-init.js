#!/usr/bin/env node

/**
 * Standalone Railway Database Initialization Runner
 * Run this script to initialize the database on Railway
 * Usage: node scripts/run-railway-init.js
 */

const { initializeRailwayDatabase } = require('./railway-init-database');

console.log('🚂 Railway Database Initialization Runner');
console.log('==========================================');
console.log('');

initializeRailwayDatabase()
  .then(() => {
    console.log('');
    console.log('🎉 SUCCESS: Railway database initialization completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy your application to Railway');
    console.log('2. Your app should now work without the "Table \'railway.requests\' doesn\'t exist" error');
    console.log('3. Test your application endpoints');
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.log('');
    console.log('💥 FAILED: Railway database initialization failed!');
    console.log('Error:', error.message);
    console.log('');
    console.log('Troubleshooting:');
    console.log('1. Check your .env file has correct database credentials');
    console.log('2. Ensure your Railway database service is running');
    console.log('3. Verify network connectivity to Railway');
    console.log('4. Check Railway dashboard for database status');
    console.log('');
    process.exit(1);
  });