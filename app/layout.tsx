import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Sidebar } from '@/components/sidebar'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'CWEN Tool',
  description: 'Collecting every item we need on site and analyzing it',
  generator: 'jackisa.com',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-6 overflow-x-hidden">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
