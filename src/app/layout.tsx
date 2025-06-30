import './globals.css'
import { Toaster } from 'react-hot-toast'
import type { Metadata } from 'next'
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'M-Pesa Demo',
  description: 'STK Push Integration Example',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
           {/* Google Analytics Script */}
           <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-T9489C6B1J"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-T9489C6B1J');
            `,
          }}
        />
      </head>
      <body>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}
