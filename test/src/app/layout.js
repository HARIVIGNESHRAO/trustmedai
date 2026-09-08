import './globals.css'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'TrustMedAI — AI-Powered Healthcare Risk Prediction',
  description: 'Explainable AI, multi-disease risk modeling, and blockchain-verified hospital recommendations for transparent healthcare decisions.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
