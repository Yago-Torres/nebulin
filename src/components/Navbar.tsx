// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { HelpOverlay } from "./HelpOverlay";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="w-full h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>

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
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-gray-700 hover:text-gray-900"
          >
            Ayuda
          </button>
        </nav>
      </header>

      <HelpOverlay 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
