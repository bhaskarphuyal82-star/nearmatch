import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Providers } from '@/components/providers';
import { BottomNav } from '@/components/ui/BottomNav';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { NotificationManagerWrapper } from '@/components/ui/NotificationManagerWrapper';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Check if user has completed onboarding
    await connectDB();
    const user = await User.findById(session.user.id).select('onboardingComplete role').lean();

    // Redirect to onboarding if not complete (skip for admins)
    if (user && !user.onboardingComplete && user.role !== 'admin') {
        redirect('/onboarding');
    }

    return (
        <Providers>
            <div className="min-h-screen bg-zinc-950 pb-20">
                <NotificationManagerWrapper />
                {children}
                <BottomNav />
            </div>
        </Providers>
    );
}
