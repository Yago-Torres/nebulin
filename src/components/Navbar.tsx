// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { HelpOverlay } from "./HelpOverlay";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <header className="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard">
            <span className="text-xl font-bold dark:text-white">Nebulin</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">
            <span className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Home
            </span>
          </Link>
          <Link href="/dashboard/account">
            <span className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Cuenta
            </span>
          </Link>
          <Link href="/dashboard/bank">
            <span className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              Fondos
            </span>
          </Link>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Ayuda
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <HelpOverlay 
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
