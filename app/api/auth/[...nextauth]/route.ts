import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                await connectDB();
                console.log(`[Authorize] Attempting login for: ${credentials.email}`);

                const user = await User.findOne({ email: credentials.email }).select('+password');
                console.log(`[Authorize] User found: ${user ? user.email : 'None'}, isBanned: ${user?.isBanned}`);

                if (!user) {
                    throw new Error('No user found with this email');
                }

                if (user.isBanned) {
                    throw new Error(`Your account (${user.email}) has been suspended`);
                }

                if (!user.password) {
                    throw new Error('Please login with your social account');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                // Update last active
                await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.photos[0] || null,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                await connectDB();

                const existingUser = await User.findOne({ email: user.email });

                if (existingUser) {
                    if (existingUser.isBanned) {
                        return false;
                    }
                    await User.findByIdAndUpdate(existingUser._id, { lastActive: new Date() });
                } else {
                    // Create new user from Google
                    if (user.email && user.name) {
                        await User.create({
                            email: user.email,
                            name: user.name,
                            photos: user.image ? [user.image] : [],
                            isVerified: true,
                            // Set defaults for discovery
                            dateOfBirth: new Date('2000-01-01'), // Default to ~24 years old
                            gender: 'male', // Default (user should update)
                            location: {
                                type: 'Point',
                                coordinates: [0, 0] // Default (user needs to update)
                            },
                            preferences: {
                                ageRange: { min: 18, max: 100 },
                                gender: 'both',
                                distance: 100
                            }
                        });
                    }
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                await connectDB();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;

                // Check if user is banned (fresh check)
                await connectDB();
                const user = await User.findById(token.id).select('isBanned email');
                console.log(`[Session Callback] Checking ban for user ${user?.email} (${token.id}): isBanned=${user?.isBanned}`);

                if (user?.isBanned) {
                    session.user.isBanned = true;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
