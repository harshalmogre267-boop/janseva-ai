import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-950/80 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold font-[family-name:var(--font-display)] text-white">
                JanSeva<span className="text-saffron-400"> AI</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed">
              AI-powered platform connecting Indian citizens with government welfare schemes they deserve.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Dashboard', 'Schemes', 'Eligibility Check', 'Bookmarks'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-surface-400 hover:text-saffron-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {['myScheme Portal', 'API Setu', 'Digital India', 'India.gov.in'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-surface-400 hover:text-saffron-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-surface-400 hover:text-saffron-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © 2026 JanSeva AI. Made with ❤️ for Digital India. Not an official government website.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-surface-500">🇮🇳 Designed for Indian Citizens</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
