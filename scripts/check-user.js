const mongoose = require('mongoose');


async function checkUser() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is likely missing in .env.local');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            isBanned: Boolean,
            name: String
        }, { strict: false }));

        const email = 'mike@example.com';
        const users = await User.find({ email });

        console.log(`Found ${users.length} users with email ${email}`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Name: ${u.name}, Banned: ${u.isBanned}`);
        });

        // Check other users too just in case
        const bannedUsers = await User.find({ isBanned: true }).select('email isBanned');
        console.log('Banned users in DB:', bannedUsers);

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkUser();
