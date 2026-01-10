import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Providers } from '@/components/providers';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Check if user is admin
    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    return (
        <Providers session={session}>
            <div className="flex min-h-screen bg-zinc-950">
                <AdminSidebar />
                <main className="flex-1 lg:ml-0">
                    <div className="p-4 lg:p-8">{children}</div>
                </main>
            </div>
        </Providers>
    );
}
