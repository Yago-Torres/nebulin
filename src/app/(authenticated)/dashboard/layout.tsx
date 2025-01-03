// src/app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />

        <main className={`flex-1 overflow-auto p-4 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'bg-white dark:bg-transparent backdrop-blur-[1px]' : 'bg-white dark:bg-transparent'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
