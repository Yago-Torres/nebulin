import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

interface HelpOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  const pathname = usePathname();

  const getHelpContent = () => {
    if (pathname.startsWith('/dashboard/leagues/')) {
      return {
        title: 'Betting System',
        content: (
          <>
            <section>
              <h3 className="text-xl font-semibold mb-2">How Betting Works</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Each event has two possible outcomes: True or False</li>
                <li>You can bet coins on either outcome</li>
                <li>Payouts are calculated based on the total bets on each side</li>
                <li>The payout ratio = (Opposite side total / Your side total) + 1</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Example</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>If True has 100 coins and False has 200 coins:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Betting on True pays 3x (200/100 + 1)</li>
                  <li>Betting on False pays 1.5x (100/200 + 1)</li>
                </ul>
              </div>
            </section>
          </>
        )
      };
    }

    if (pathname === '/dashboard/account') {
      return {
        title: 'Account Management',
        content: (
          <section>
            <h3 className="text-xl font-semibold mb-2">Account Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>View your betting history</li>
              <li>Check your current coin balance</li>
              <li>Update your profile information</li>
              <li>Manage league memberships</li>
            </ul>
          </section>
        )
      };
    }

    if (pathname === '/dashboard/bank') {
      return {
        title: 'Bank Functions',
        content: (
          <section>
            <h3 className="text-xl font-semibold mb-2">Banking System</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Deposit coins into leagues</li>
              <li>Withdraw available winnings</li>
              <li>View transaction history</li>
              <li>Transfer coins between leagues</li>
            </ul>
          </section>
        )
      };
    }

    if (pathname === '/dashboard') {
      return {
        title: 'Leagues Dashboard',
        content: (
          <section>
            <h3 className="text-xl font-semibold mb-2">Managing Leagues</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>View all leagues you're a member of</li>
              <li>Click on a league card to view its events</li>
              <li>Create a new league using the + button</li>
              <li>Each league shows its member count and description</li>
            </ul>
          </section>
        )
      };
    }

    return {
      title: 'Help',
      content: <p>Select a section to view specific help information.</p>
    };
  };

  const helpContent = getHelpContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:right-auto md:-translate-x-1/2 
                     bg-white rounded-lg shadow-xl z-50 max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{helpContent.title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {helpContent.content}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 