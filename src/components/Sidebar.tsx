// src/components/Sidebar.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, UserPlus, Bell } from "lucide-react";
import FriendsList from "@/components/FriendsList";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from 'react';
import { logger } from "@/utils/logger";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [hasRequests, setHasRequests] = useState(false);

  useEffect(() => {
    logger.info('Friend requests status changed:', hasRequests);
  }, [hasRequests]);

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
            className="fixed top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-[100] flex flex-col"
          >
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 p-4 font-bold text-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>Amigos</span>
                {hasRequests && (
                  <Badge variant="destructive" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                    <Bell className="h-4 w-4" />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" onClick={onClose} className="hidden md:block">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <FriendsList onRequestsChange={setHasRequests} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Link href="/dashboard/search">
                <Button className="w-full flex items-center gap-2" variant="outline">
                  <UserPlus className="h-4 w-4" />
                  Agregar Amigos
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}