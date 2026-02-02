import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UX Review - AI-Powered Design Feedback',
  description: 'Get professional UI/UX design reviews powered by Claude AI. Upload your Figma screenshots and receive detailed, actionable feedback.',
  keywords: ['UX review', 'UI design', 'design feedback', 'Figma', 'AI', 'Claude'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
