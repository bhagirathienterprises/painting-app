import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { colors, typography } from "../lib/designSystem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Painting Business Manager',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: colors.primary,
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{
        backgroundColor: colors.background,
        color: colors.textPrimary,
      }}
    >
      <head>
        <style>{`
          * {
            font-family: ${typography.fontFamily.body};
          }
          
          body {
            background: linear-gradient(135deg, ${colors.background} 0%, ${colors.backgroundDark} 100%);
            color: ${colors.textPrimary};
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          ::selection {
            background-color: ${colors.primary};
            color: white;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${colors.background};
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${colors.border};
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${colors.textTertiary};
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
