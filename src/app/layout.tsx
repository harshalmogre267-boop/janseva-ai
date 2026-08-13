import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "JanSeva AI — Smart Government Scheme Finder for India",
  description:
    "AI-powered platform that automatically matches Indian citizens with eligible government schemes based on their profile. Find PM Kisan, Ayushman Bharat, PM Awas and 150+ schemes instantly.",
  keywords: [
    "government schemes",
    "India",
    "PM Kisan",
    "Ayushman Bharat",
    "eligibility checker",
    "AI recommendations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
              }
            `,
          }}
        />
        <Script 
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" 
          strategy="afterInteractive"
        />
        
        <ThemeProvider>
          <AuthProvider>
            <TranslationProvider>
              {children}
            </TranslationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
