'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, MapPin, MessageCircle, Shield, Sparkles, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-2xl bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-3 group shrink-0">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform duration-300">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="currentColor" />
              </div>
              <span className="text-lg sm:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 block">
                NearMatch
              </span>
            </Link>

            <nav className="flex items-center gap-1.5 sm:gap-6">
              {status === 'loading' ? (
                <div className="w-20 sm:w-24 h-9 sm:h-10 bg-white/5 rounded-full animate-pulse" />
              ) : session?.user ? (
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/discover'}
                  className="relative group px-4 sm:px-6 py-2 sm:py-2.5 rounded-full overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 group-hover:opacity-90 transition-opacity" />
                  <span className="relative text-xs sm:text-sm font-bold tracking-wide">Enter App</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-black text-xs sm:text-sm font-bold hover:bg-zinc-200 transition-all duration-300 shadow-xl shadow-white/10"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 sm:pt-52 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Next Gen Social</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] sm:leading-[0.85] mb-8"
            >
              Find Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient-x">
                Local Community
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="max-w-xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-12 sm:px-4"
            >
              Explore your local community. NearMatch helps you find friends and groups near you with similar interests.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-4"
            >
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-pink-500/25 flex items-center justify-center gap-3 group"
              >
                Start Your Journey
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-xl flex items-center justify-center"
              >
                Discovery More
              </Link>
            </motion.div>

            {/* Stats - Floating Style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-24 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {[
                { value: '10M+', label: 'Active Users', icon: Users },
                { value: '5M+', label: 'Daily Sparks', icon: Heart },
                { value: '150+', label: 'Global Cities', icon: MapPin },
                { value: '4.9★', label: 'User Rating', icon: Sparkles },
              ].map((stat, idx) => (
                <div key={idx} className="relative group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-pink-500/80 transition-colors">{stat.label}</div>
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style for Modern Look */}
      <section id="features" className="relative z-10 py-32 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Elevated Social Experience</h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto italic">Crafted for modern connections, powered by empathy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]">
            {[
              {
                icon: MapPin,
                title: 'Proximity Flow',
                description: 'Real-time proximity matching that respects your context.',
                className: 'lg:col-span-2 lg:row-span-1 bg-gradient-to-br from-pink-500/10 to-transparent',
              },
              {
                icon: Shield,
                title: 'Private by Design',
                description: 'End-to-end encrypted signals and rigorous verification.',
                className: 'bg-zinc-900/40',
              },
              {
                icon: MessageCircle,
                title: 'Dynamic Conversations',
                description: 'Expression-first chat with rich media and interactive sparks.',
                className: 'bg-zinc-900/40',
              },
              {
                icon: Sparkles,
                title: 'Pulse Connections',
                description: 'AI-driven suggestions that evolve with your personality.',
                className: 'lg:col-span-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className={`group relative p-8 rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-300 ${feature.className}`}
              >
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-7 h-7 text-pink-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Content */}
      <DynamicHomeContent />

      {/* CTA Section - Full Visual Impact */}
      <section className="relative z-10 py-32 sm:py-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-900/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="p-12 sm:p-20 rounded-[3rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl shadow-2xl relative"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl bg-pink-500 flex items-center justify-center shadow-2xl shadow-pink-500/50 rotate-12">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-8">Ready for something real?</h2>
            <p className="text-xl text-zinc-400 mb-12 max-w-lg mx-auto leading-relaxed">
              Stop settling. Start discovering. Join the NearMatch community today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-12 py-6 rounded-2.5xl bg-white text-black font-black text-xl hover:bg-zinc-200 transition-all duration-300 hover:tracking-wide active:scale-95 shadow-2xl shadow-white/10"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal & Premium */}
      <footer className="relative z-10 border-t border-border/10 py-20 bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 px-4 sm:px-0">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <span className="text-xl font-black tracking-tighter">NearMatch</span>
              </Link>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed mb-8">
                The modern social standard for humans seeking authentic, proximity-based connections. Zero noise. Pure spark.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-xs text-white/50">Experience</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/about" className="text-sm text-zinc-500 hover:text-white transition-colors">Vision</Link>
                <Link href="/guidelines" className="text-sm text-zinc-500 hover:text-white transition-colors">Community Guidelines</Link>
                <Link href="/premium" className="text-sm text-zinc-500 hover:text-white transition-colors">Go Premium</Link>
              </nav>
            </div>

            <div>
              <h4 className="font-bold mb-6 tracking-widest uppercase text-xs text-white/50">Legal</h4>
              <nav className="flex flex-col gap-4">
                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms</Link>
                <Link href="/cookies" className="text-sm text-zinc-500 hover:text-white transition-colors">Cookies</Link>
              </nav>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 px-4 sm:px-0">
            <p className="text-xs font-medium text-muted-foreground tracking-widest">© 2026 NEAR MATCH CO. ESTABLISHED WORLDWIDE.</p>
            <div className="flex gap-6">
              <Link href="/contact" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">Support</Link>
              <span className="text-zinc-800">//</span>
              <Link href="/status" className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">All Systems Go</Link>
            </div>
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
