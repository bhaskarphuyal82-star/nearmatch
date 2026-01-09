import { connectDB } from '../lib/db';
import User from '../lib/models/User';
import Match from '../lib/models/Match';
import Message from '../lib/models/Message';

async function seedMatches() {
    console.log('🔄 Creating sample matches and messages...\n');

    try {
        await connectDB();

        // Get users
        const testUser = await User.findOne({ email: 'user@nearmatch.com' });
        const sarah = await User.findOne({ email: 'sarah@example.com' });
        const emma = await User.findOne({ email: 'emma@example.com' });
        const mike = await User.findOne({ email: 'mike@example.com' });

        if (!testUser) {
            console.log('❌ Test user not found. Run seed-users.ts first.');
            process.exit(1);
        }

        // Create matches
        const matchesToCreate = [
            { user1: testUser, user2: sarah },
            { user1: testUser, user2: emma },
        ];

        for (const { user1, user2 } of matchesToCreate) {
            if (!user2) continue;

            // Check if match already exists
            const existingMatch = await Match.findOne({
                users: { $all: [user1._id, user2._id] },
            });

            if (existingMatch) {
                console.log(`ℹ️  Match already exists: ${user1.name} ↔ ${user2.name}`);
                continue;
            }

            // Add mutual likes
            await User.findByIdAndUpdate(user1._id, {
                $addToSet: { likedUsers: user2._id },
            });
            await User.findByIdAndUpdate(user2._id, {
                $addToSet: { likedUsers: user1._id },
            });

            // Create match
            const match = await Match.create({
                users: [user1._id, user2._id],
                matchedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
            });

            console.log(`✅ Match created: ${user1.name} ↔ ${user2.name}`);

            // Add sample messages
            const messages = [
                { sender: user2._id, content: 'Hey! Nice to match with you! 👋' },
                { sender: user1._id, content: 'Hi! Thanks, you too! 😊' },
                { sender: user2._id, content: 'What are you up to today?' },
            ];

            for (const msg of messages) {
                await Message.create({
                    match: match._id,
                    sender: msg.sender,
                    content: msg.content,
                    type: 'text',
                    isRead: true,
                    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                });
            }

            // Update match with last message time
            await Match.findByIdAndUpdate(match._id, { lastMessage: new Date() });

            console.log(`   📨 Added ${messages.length} sample messages`);
        }

        // Also create a match with mike (for discovery, not for test user)
        if (mike && sarah) {
            const existingMatch = await Match.findOne({
                users: { $all: [mike._id, sarah._id] },
            });

            if (!existingMatch) {
                await Match.create({
                    users: [mike._id, sarah._id],
                });
                console.log(`✅ Match created: ${mike.name} ↔ ${sarah.name}`);
            }
        }

        // Summary
        const totalMatches = await Match.countDocuments();
        const totalMessages = await Message.countDocuments();

        console.log('\n📊 Database Summary:');
        console.log(`   Total matches: ${totalMatches}`);
        console.log(`   Total messages: ${totalMessages}`);

        console.log('\n✅ Sample data created!');
        console.log('\n💡 Login with user@nearmatch.com / user123 to see matches');

    } catch (error) {
        console.error('❌ Failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

seedMatches();
