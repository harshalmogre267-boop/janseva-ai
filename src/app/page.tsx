'use client';

import Link from 'next/link';
import { Shield, ArrowRight, Search, Brain, Users, Globe, BookOpen, Sparkles, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { schemeCategories } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Government Schemes', value: '150+' },
  { label: 'Citizens Helped', value: '15K+' },
  { label: 'States Covered', value: '36' },
  { label: 'AI Accuracy', value: '95%' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description: 'Our Gemini AI analyzes your profile against 150+ schemes to find your best matches with eligibility scoring.',
    color: '#f97316',
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'Advanced search and filters to browse schemes by category, state, income level, and more.',
    color: '#3b82f6',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Access information in Hindi, Tamil, Bengali, Telugu, Marathi and English.',
    color: '#10b981',
  },
  {
    icon: BookOpen,
    title: 'Application Guide',
    description: 'Step-by-step guidance with required documents checklist for every scheme application.',
    color: '#8b5cf6',
  },
  {
    icon: Users,
    title: 'AI Chatbot Assistant',
    description: 'Ask questions about any scheme in natural language and get instant, accurate answers.',
    color: '#ec4899',
  },
  {
    icon: Sparkles,
    title: 'Voice Assistant',
    description: 'Use voice commands to search schemes and check eligibility — hands-free interaction.',
    color: '#eab308',
  },
];

const testimonials = [
  { name: 'Ramesh Patel', state: 'Gujarat', text: 'Found 5 schemes I never knew existed. Got ₹6000 from PM Kisan within weeks!', rating: 5 },
  { name: 'Priya Devi', state: 'Bihar', text: 'The AI chatbot explained Ayushman Bharat in Hindi. My family now has ₹5 lakh health coverage.', rating: 5 },
  { name: 'Suresh Kumar', state: 'UP', text: 'As a farmer, this tool matched me with 8 different schemes. Truly helpful for rural people.', rating: 5 },
];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % schemeCategories.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen mesh-gradient overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center shadow-lg shadow-saffron-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-white">
                JanSeva<span className="text-saffron-400"> AI</span>
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center gap-6"
            >
              <a href="#features" className="text-sm text-surface-400 hover:text-white transition-colors">Features</a>
              <a href="#categories" className="text-sm text-surface-400 hover:text-white transition-colors">Categories</a>
              <a href="#testimonials" className="text-sm text-surface-400 hover:text-white transition-colors">Reviews</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/auth"
                className="px-5 py-2 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-saffron-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all block"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-saffron-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-60 right-10 w-96 h-96 bg-navy-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-emerald-500/5 to-transparent rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold font-[family-name:var(--font-display)] text-white mb-6 leading-tight"
          >
            Find Government Schemes
            <br />
            <span className="gradient-text">You Deserve</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered platform that automatically matches Indian citizens with
            <span className="text-white font-medium"> 150+ government welfare schemes </span>
            based on your profile. Get personalized recommendations in seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/auth"
              className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-saffron-500/30 hover:-translate-y-1 active:translate-y-0 transition-all text-base"
            >
              Check Your Eligibility
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/schemes"
              className="flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-base"
            >
              <Search className="w-4 h-4" />
              Browse Schemes
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.label}
                whileHover={{ y: -5, rotateX: 5, rotateY: 5 }}
                className="glass-card rounded-2xl p-4 text-center z-10"
              >
                <p className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-display)]">{stat.value}</p>
                <p className="text-xs text-surface-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
              Three Simple Steps
            </h2>
            <p className="text-surface-400 text-lg">From sign-up to scheme benefits in minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create Profile', desc: 'Sign in with your mobile number and fill in your basic details — income, education, state, category.', icon: '📱' },
              { step: '02', title: 'AI Analysis', desc: 'Our AI analyzes 150+ schemes against your profile and calculates eligibility scores instantly.', icon: '🤖' },
              { step: '03', title: 'Get Benefits', desc: 'View matched schemes, read application guides, and apply directly to official portals.', icon: '✅' },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                className="glass-card rounded-2xl p-6 text-center relative group z-10"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <span className="absolute top-4 right-4 text-xs font-bold text-saffron-500/30 font-[family-name:var(--font-display)]">{item.step}</span>
                <h3 className="text-lg font-semibold text-white mb-2 font-[family-name:var(--font-display)]">{item.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-surface-600" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
              Powerful Features
            </h2>
            <p className="text-surface-400 text-lg">Everything you need to discover and apply for government schemes</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -8, rotateX: 10, rotateY: -5, boxShadow: `0 20px 40px -10px ${feature.color}40` }}
                className="glass-card rounded-2xl p-6 group z-10"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-[family-name:var(--font-display)]">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
              Scheme Categories
            </h2>
            <p className="text-surface-400 text-lg">Covering every sector of citizen welfare</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {schemeCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotateZ: 2 }}
                className={`glass-card rounded-2xl p-4 text-center cursor-pointer transition-all duration-500 z-10 ${
                  activeCategory === i ? 'scale-105 !border-opacity-30' : ''
                }`}
                style={activeCategory === i ? { borderColor: cat.color, boxShadow: `0 0 30px ${cat.color}15` } : {}}
                onClick={() => setActiveCategory(i)}
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-white">{cat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
              Real Impact Stories
            </h2>
            <p className="text-surface-400 text-lg">See how JanSeva AI is changing lives</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -5, rotateX: 5, rotateY: -5 }}
                className="glass-card rounded-2xl p-6 z-10"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-saffron-400 fill-saffron-400" />
                  ))}
                </div>
                <p className="text-sm text-surface-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-navy-600 flex items-center justify-center text-white text-sm font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-surface-500">{t.state}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="glass-card rounded-3xl p-10 md:p-14 relative overflow-hidden gradient-border">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-saffron-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display)] mb-4">
                Don&apos;t Miss Out on Benefits
                <br />
                <span className="gradient-text-static">You&apos;re Entitled To</span>
              </h2>
              <p className="text-surface-400 mb-8 text-lg">
                Join 15,000+ citizens who discovered schemes they never knew about
              </p>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 inline-block"
              >
                <Link
                  href="/auth"
                  className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-saffron-500/30 transition-all"
                >
                  Start Free — No Sign Up Fee
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-surface-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Free</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No Documents Needed</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant Results</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-saffron-500" />
            <span className="text-sm font-semibold text-white font-[family-name:var(--font-display)]">JanSeva AI</span>
          </div>
          <p className="text-xs text-surface-500">© 2026 JanSeva AI. Made with ❤️ for Digital India. Not an official government website.</p>
          <span className="text-xs text-surface-500">🇮🇳 Jai Hind</span>
        </div>
      </footer>
    </div>
  );
}
