export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                <svg
                    className="w-12 h-12 text-pink-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                    />
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Offline</h1>
            <p className="text-zinc-400 max-w-sm mb-6">
                It looks like you&apos;re not connected to the internet. Check your connection and try again.
            </p>

            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-shadow"
            >
                Try Again
            </button>
        </div>
    );
}
