import type { Metadata } from 'next';
import { VT323, Press_Start_2P } from 'next/font/google';
import './globals.css';

const vt323 = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vt323',
});

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-press-start',
});

export const metadata: Metadata = {
  title: 'SS THRESHER — MAINT TERMINAL 07',
  description: 'Interactive space terminal game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${vt323.variable} ${pressStart2P.variable}`}>
      <body className="font-vt323 antialiased bg-black text-[#39ff88]">
        {children}
      </body>
    </html>
  );
}
