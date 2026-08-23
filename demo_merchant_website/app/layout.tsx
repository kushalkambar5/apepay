import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApeCommerce Store | Privacy-Preserving Demo Merchant',
  description:
    'Demonstration e-commerce storefront powered by ApePay crypto payment gateway and zkBob zero-knowledge privacy commitment protocol.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-[#171717] antialiased">
        {children}
      </body>
    </html>
  );
}
