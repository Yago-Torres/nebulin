// src/components/Sidebar.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetClose, SheetTitle } from "@/components/ui/sheet"; 
import { Button } from "@/components/ui/button";
import { X } from "lucide-react"; // Close icon for mobile sheet

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      {/* Remove md:translate-x-0 so that open state controls visibility on all screens */}
      <div className={`hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 font-bold text-xl flex items-center justify-between">
          <span>Menu</span>
          {/* Add a close button on desktop if you want to hide it from desktop as well */}
          <Button variant="ghost" onClick={onClose} className="hidden md:block">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col space-y-2 p-4">
          <a href="/dashboard/lobbies" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Lobbies</a>
          <a href="/dashboard/bets" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Bets I’m In</a>
        </nav>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 bg-white border-r border-gray-200">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" className="absolute top-4 right-4">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </SheetHeader>
          <nav className="mt-4 flex flex-col space-y-2 p-4">
            <a href="/dashboard/lobbies" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Lobbies</a>
            <a href="/dashboard/bets" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Bets I’m In</a>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
