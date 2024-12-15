// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react"; // Using Lucide icons as per your code, or heroicons if you prefer
import { useState } from "react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        {/* Always show the toggle button, no matter the screen size */}
        <Button variant="ghost" onClick={onToggleSidebar}>
          {/* Just show the Menu icon here; we'll handle state in the parent */}
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo or App Name */}
        <Link href="/dashboard">
          <span className="text-xl font-bold">Nebulin</span>
        </Link>
      </div>
      
      <nav className="flex items-center gap-4">
        <Link href="/dashboard">
          <span className="text-gray-700 hover:text-gray-900">Home</span>
        </Link>
        <Link href="/dashboard/account">
          <span className="text-gray-700 hover:text-gray-900">Account</span>
        </Link>
        <Link href="/dashboard/bank">
          <span className="text-gray-700 hover:text-gray-900">Bank</span>
        </Link>
      </nav>
    </header>
  );
}
