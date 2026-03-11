import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3D Print Library - Drive Explorer',
  description: 'Explore e baixe modelos 3D do acervo INEMA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
