const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('⚠️  Admin user already exists:');
            console.log(`   Username: ${adminExists.username}`);
            console.log(`   Email: ${adminExists.email}`);
            console.log('\n💡 If you want to create a new admin, please delete the existing one first.');
            process.exit(0);
        }

        // Create admin user
        const adminData = {
            displayName: process.env.ADMIN_DISPLAYNAME || 'Administrator',
            username: process.env.ADMIN_USERNAME || 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@tintuc24h.com',
            password: process.env.ADMIN_PASSWORD || '123456',
            role: 'admin'
        };

        const admin = await User.create(adminData);

        console.log('\n🎉 Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`👤 Username: ${admin.username}`);
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Password: ${adminData.password}`);
        console.log(`👑 Role: ${admin.role}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Please change the password after first login!');
        console.log('💡 You can set custom credentials in .env file:');
        console.log('   ADMIN_USERNAME=your_username');
        console.log('   ADMIN_EMAIL=your_email@example.com');
        console.log('   ADMIN_PASSWORD=your_secure_password\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();
