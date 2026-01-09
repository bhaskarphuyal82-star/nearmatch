'use client';

import { useEffect, useState } from 'react';
import { LegalContent } from './LegalContent';
import { Loader2 } from 'lucide-react';

interface LegalPageProps {
    type: 'about' | 'privacyPolicy' | 'termsService' | 'cookiePolicy' | 'communityGuidelines' | 'noticeAtCollection' | 'contactDetails';
    title: string;
}

export function LegalPage({ type, title }: LegalPageProps) {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch('/api/config');
                if (res.ok) {
                    const data = await res.json();
                    setContent(data.legal[type] || '');
                }
            } catch (error) {
                console.error('Failed to fetch legal content:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [type]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            </div>
        );
    }

    return <LegalContent title={title} content={content || ''} />;
}
