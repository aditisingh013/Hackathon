/**
 * seed.js — Populate MongoDB with mock data.
 *
 * Usage:  npm run seed
 *
 * This clears the employees collection and inserts fresh
 * mock data. Safe to run multiple times.
 */

require('dotenv').config();
const mongoose      = require('mongoose');
const Employee      = require('./models/Employee');
const mockEmployees = require('./mock_data/employees');

async function seed() {
  try {
    // Connect to MongoDB
    const atlasUri = process.env.MONGODB_URI;
    const localUri = 'mongodb://127.0.0.1:27017/burnout_db';
    try {
      await mongoose.connect(atlasUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB Atlas');
    } catch (e) {
      console.log('⚠️ Atlas Connection Failed. Error:', e.message);
      console.log('⚠️ Attempting to fallback to Local MongoDB...');
      await mongoose.connect(localUri);
      console.log('✅ Connected to Local MongoDB');
    }

    // Clear existing data
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing employees');

    // Insert mock data
    const created = await Employee.insertMany(mockEmployees);
    console.log(`🌱 Seeded ${created.length} employees with activity logs`);

    // Print summary
    const depts = {};
    created.forEach(e => {
      depts[e.department] = (depts[e.department] || 0) + 1;
    });
    console.log('\n📊 Department breakdown:');
    Object.entries(depts).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} employees`);
    });

    const risks = { Low: 0, Medium: 0, High: 0 };
    created.forEach(e => { risks[e.burnoutRisk] += 1; });
    console.log('\n🔥 Burnout risk distribution:');
    Object.entries(risks).forEach(([risk, count]) => {
      console.log(`   ${risk}: ${count} employees`);
    });

    console.log('\n✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
