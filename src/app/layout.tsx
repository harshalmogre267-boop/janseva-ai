import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { TranslationProvider } from "@/contexts/translation-context";

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
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
        
        <AuthProvider>
          <TranslationProvider>
            {children}
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
