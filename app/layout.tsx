import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Precious Metals Sentiment | Gold, Silver, Copper, Platinum',
  description: 'Real-time sentiment analysis from Reddit and news for Gold, Silver, Copper, and Platinum markets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🪙</span>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Precious Metals
                    </h1>
                    <p className="text-xs text-gray-500">
                      Sentiment Tracker
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-500">Live from Reddit</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-sm text-gray-500">
                Sentiment data from Reddit communities and news sources. Refreshes every 5 minutes.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
