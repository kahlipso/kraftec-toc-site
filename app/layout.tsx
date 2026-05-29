import Navbar from '@/app/components/Navbar';
import Footer  from "@/app/components/Footer";
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
