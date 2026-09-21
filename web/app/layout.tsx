import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ultra Bridge: JAWS and NVDA command assistant',
  description:
    'Find, compare and translate JAWS and NVDA keyboard commands. Answers come from a structured Sanity dataset, not from guesswork.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
