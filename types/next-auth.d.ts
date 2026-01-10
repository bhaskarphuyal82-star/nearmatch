
import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            isBanned?: boolean;
            onboardingComplete: boolean;
            createdAt: string;
            dateOfBirth: string | null;
        } & DefaultSession['user'];
    }

    interface User {
        role: string;
        isBanned?: boolean;
        onboardingComplete: boolean;
        createdAt: Date;
        dateOfBirth?: Date;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
        isBanned?: boolean;
        onboardingComplete: boolean;
        createdAt: string;
        dateOfBirth: string | null;
    }
}
