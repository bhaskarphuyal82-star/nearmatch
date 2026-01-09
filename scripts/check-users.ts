import { connectDB } from '../lib/db';
import User from '../lib/models/User';

async function check() {
    try {
        await connectDB();
        const users = await User.find({}, 'name gender likedUsers dislikedUsers preferences');
        users.forEach(u => {
            console.log(JSON.stringify(u, null, 2));
        });
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

check();
