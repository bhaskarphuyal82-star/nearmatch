import { connectDB } from '../lib/db';
import User from '../lib/models/User';

async function testConnection() {
    console.log('🔄 Testing MongoDB connection...');

    try {
        await connectDB();
        console.log('✅ MongoDB connected successfully!');

        // Test query
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);

        // Check indexes
        const indexes = await User.collection.indexes();
        console.log('📌 User collection indexes:', indexes.map(i => i.name).join(', '));

        console.log('\n✅ Database connection test passed!');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

testConnection();
