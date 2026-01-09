import { connectDB } from '../lib/db';
import User from '../lib/models/User';
import bcrypt from 'bcryptjs';

async function seedUsers() {
    console.log('🔄 Seeding users...');

    try {
        await connectDB();

        // Create Admin User
        const adminEmail = 'admin@nearmatch.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                isVerified: true,
                bio: 'NearMatch Administrator',
                gender: 'other',
                location: {
                    type: 'Point',
                    coordinates: [85.3240, 27.7172], // Kathmandu
                },
                preferences: {
                    ageRange: { min: 18, max: 50 },
                    distance: 100,
                    gender: 'both',
                },
            });
            console.log('✅ Admin user created:');
            console.log('   Email: admin@nearmatch.com');
            console.log('   Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create Regular User
        const userEmail = 'user@nearmatch.com';
        const existingUser = await User.findOne({ email: userEmail });

        if (!existingUser) {
            const hashedPassword = await bcrypt.hash('user123', 12);
            await User.create({
                email: userEmail,
                password: hashedPassword,
                name: 'Test User',
                role: 'user',
                isVerified: true,
                bio: 'Hello! Looking for someone special.',
                gender: 'male',
                dateOfBirth: new Date('1995-05-15'),
                location: {
                    type: 'Point',
                    coordinates: [85.3240, 27.7172], // Kathmandu
                },
                preferences: {
                    ageRange: { min: 20, max: 35 },
                    distance: 50,
                    gender: 'female',
                },
            });
            console.log('✅ Regular user created:');
            console.log('   Email: user@nearmatch.com');
            console.log('   Password: user123');
        } else {
            console.log('ℹ️  Regular user already exists');
        }

        // Create a few more sample users for testing
        const sampleUsers = [
            {
                email: 'sarah@example.com',
                name: 'Sarah Johnson',
                gender: 'female',
                bio: 'Love hiking and photography 📸',
                dateOfBirth: new Date('1998-03-22'),
            },
            {
                email: 'mike@example.com',
                name: 'Mike Chen',
                gender: 'male',
                bio: 'Coffee enthusiast ☕ | Tech lover',
                dateOfBirth: new Date('1996-11-08'),
            },
            {
                email: 'emma@example.com',
                name: 'Emma Wilson',
                gender: 'female',
                bio: 'Music is my escape 🎵',
                dateOfBirth: new Date('1999-07-14'),
            },
        ];

        for (const userData of sampleUsers) {
            const exists = await User.findOne({ email: userData.email });
            if (!exists) {
                const hashedPassword = await bcrypt.hash('password123', 12);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                    role: 'user',
                    isVerified: true,
                    location: {
                        type: 'Point',
                        coordinates: [85.3240 + (Math.random() - 0.5) * 0.1, 27.7172 + (Math.random() - 0.5) * 0.1],
                    },
                    preferences: {
                        ageRange: { min: 20, max: 40 },
                        distance: 50,
                        gender: 'both',
                    },
                });
                console.log(`✅ Sample user created: ${userData.name}`);
            }
        }

        // Final count
        const totalUsers = await User.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });
        const userCount = await User.countDocuments({ role: 'user' });

        console.log('\n📊 Database Summary:');
        console.log(`   Total users: ${totalUsers}`);
        console.log(`   Admins: ${adminCount}`);
        console.log(`   Users: ${userCount}`);

        console.log('\n✅ Seeding complete!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedUsers();
