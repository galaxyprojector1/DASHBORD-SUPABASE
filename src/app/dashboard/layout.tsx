import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center p-4 border-b bg-white sticky top-0 z-50">
        <MobileSidebar />
        <h1 className="ml-4 text-xl font-bold">Dashboard</h1>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="md:pl-72">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
