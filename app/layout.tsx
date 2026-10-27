export const metadata = {
  title: 'Jimmy, Sea & Avocean Fan Calendar',
  description: 'Fan calendar for Jimmy, Sea, and Avocean ✨',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#FDFBF0] text-slate-900 antialiased">{children}</body>
    </html>
  )
}
