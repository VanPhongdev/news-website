const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Đã kết nối MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log(' Tài khoản Admin đã tồn tại!');
            console.log(` Username: ${adminExists.username}`);
            console.log(` Email: ${adminExists.email}`);
            console.log('\n Nếu bạn muốn tạo một admin mới, vui lòng xóa admin hiện tại trước.');
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

        console.log('\n Tài khoản Admin đã được tạo thành công!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${adminData.password}`);
        console.log(`Role: ${admin.role}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        process.exit(0);
    } catch (error) {
        console.error('Lỗi khi tạo tài khoản Admin:', error.message);
        process.exit(1);
    }
};

createAdminUser();
