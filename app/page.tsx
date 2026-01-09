'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, MapPin, MessageCircle, Shield, Sparkles, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">NearMatch</span>
            </Link>
            <div className="flex items-center gap-4">
              {status === 'loading' ? (
                <div className="w-20 h-8 bg-zinc-800 rounded-full animate-pulse" />
              ) : session?.user ? (
                <>
                  <span className="hidden sm:inline-block text-zinc-300">
                    Welcome back, <span className="text-white font-medium">{session.user.name?.split(' ')[0] || 'User'}</span>
                  </span>
                  <Link
                    href={session.user.role === 'admin' ? '/admin' : '/discover'}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-medium hover:opacity-90 transition-opacity"
                  >
                    Go to App
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-medium hover:opacity-90 transition-opacity"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Find Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                Perfect Match
              </span>{' '}
              Nearby
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto"
            >
              Connect with people around you. Discover meaningful relationships with our intelligent matching system.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start Matching
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-zinc-700 font-semibold text-lg hover:bg-zinc-800/50 transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: '10M+', label: 'Active Users' },
              { value: '5M+', label: 'Matches Made' },
              { value: '150+', label: 'Countries' },
              { value: '4.8★', label: 'App Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                  {stat.value}
                </p>
                <p className="mt-1 text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Why Choose NearMatch?</h2>
            <p className="mt-4 text-lg text-zinc-400">Discover what makes us different</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Location-Based Matching',
                description: 'Find people near you with our intelligent geolocation system. Meet someone just around the corner.',
                gradient: 'from-pink-500 to-rose-600',
              },
              {
                icon: Heart,
                title: 'Smart Matching',
                description: 'Our algorithm learns your preferences and shows you the most compatible matches.',
                gradient: 'from-purple-500 to-violet-600',
              },
              {
                icon: MessageCircle,
                title: 'Real-time Chat',
                description: 'Connect instantly with your matches through our seamless messaging system.',
                gradient: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                description: 'Feel safe with our verified profiles and active moderation team.',
                gradient: 'from-green-500 to-emerald-600',
              },
              {
                icon: Users,
                title: 'Community Events',
                description: 'Join local events and meet people who share your interests.',
                gradient: 'from-orange-500 to-amber-600',
              },
              {
                icon: Sparkles,
                title: 'Premium Features',
                description: 'Unlock unlimited likes, see who likes you, and boost your profile.',
                gradient: 'from-pink-500 to-purple-600',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Content Section */}
      <DynamicHomeContent />

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Find Your Match?
          </h2>
          <p className="text-xl text-zinc-400 mb-10">
            Join millions of users who have found meaningful connections on NearMatch.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            <Heart className="w-5 h-5" fill="white" />
            Create Your Profile
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold">NearMatch</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-zinc-400">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
              <Link href="/guidelines" className="hover:text-white transition-colors">Guidelines</Link>
              <Link href="/collection-notice" className="hover:text-white transition-colors">Notice At Collection</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-zinc-500">
              © 2026 NearMatch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DynamicHomeContent() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (data.legal && data.legal.homeContent) {
            setContent(data.legal.homeContent);
          }
        }
      } catch (error) {
        console.error('Failed to fetch home content:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  if (loading) return null;
  if (!content) return null;

  return (
    <section className="relative z-10 py-24 border-t border-zinc-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-invert max-w-none text-center"
        >
          <div className="space-y-4">
            {content.split('\n').map((line, i) => (
              <p key={i} className="text-xl text-zinc-400 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
