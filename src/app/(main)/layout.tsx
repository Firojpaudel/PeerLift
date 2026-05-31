import { Navbar } from "@/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <Navbar />

      {/* Main viewport */}
      <div className="flex flex-1 overflow-hidden transition-colors">
        {children}
      </div>
    </div>
  )
}
