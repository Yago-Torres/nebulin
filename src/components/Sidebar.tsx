// src/components/Sidebar.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetClose, SheetTitle } from "@/components/ui/sheet"; 
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { UserPlusIcon } from "lucide-react";
import FriendsList from "@/components/FriendsList";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const sidebarItems = [
    {
      title: "Buscar Amigos",
      href: "/dashboard/search",
      icon: UserPlusIcon
    }
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
            onClick={onClose}
          />

          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto shadow-lg z-[100]"
          >
            <div className="h-16 border-b border-gray-200 p-4 font-bold text-xl flex items-center justify-between">
              <span>Menu</span>
              <Button variant="ghost" onClick={onClose} className="hidden md:block">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-2 p-4">
              <a href="/dashboard/lobbies" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Lobbies</a>
              <a href="/dashboard/bets" className="text-gray-700 hover:bg-gray-100 p-2 rounded">Bets I'm In</a>
            </nav>
            <div className="mt-auto">
              <FriendsList />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
