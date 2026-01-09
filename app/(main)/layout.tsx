import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { Sidebar } from '@/components/ui/Sidebar';
import { BottomNav } from '@/components/ui/BottomNav';
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

    // Check if banned - Global check handles this now
    // @ts-ignore
    // const isBanned = session?.user?.isBanned || false;

    // Check if user has completed onboarding
    await connectDB();
    const user = await User.findById(session.user.id).select('onboardingComplete role').lean();

    // Redirect to onboarding if not complete (skip for admins)
    if (user && !user.onboardingComplete && user.role !== 'admin') {
        redirect('/onboarding');
    }

    return (
        <div className="min-h-screen bg-zinc-950">
            <NotificationManagerWrapper />
            <Sidebar user={session?.user} />
            <main className="flex-1 pb-20 md:pb-0 md:pl-64">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
