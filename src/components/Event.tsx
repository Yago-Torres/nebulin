import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { formatDateTime } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
  };
}

export function Event({ event }: EventProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [trueBets, setTrueBets] = useState(0);
  const [falseBets, setFalseBets] = useState(0);

  useEffect(() => {
    fetchBets();
  }, [event.id]);

  const fetchBets = async () => {
    const { data: bets, error } = await supabase
      .from('bets')
      .select('*')
      .eq('event_id', event.id);

    if (error) {
      console.error('Error fetching bets:', error);
      return;
    }

    const trueSum = bets?.filter(bet => bet.prediction).reduce((sum, bet) => sum + bet.amount, 0) || 0;
    const falseSum = bets?.filter(bet => !bet.prediction).reduce((sum, bet) => sum + bet.amount, 0) || 0;

    setTrueBets(trueSum);
    setFalseBets(falseSum);
  };

  const handleBetClick = () => {
    const leagueId = pathname?.split('/')[3];
    router.push(`/dashboard/leagues/${leagueId}/events/${event.id}/bet`);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold">{event.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
      <div className="text-sm text-gray-500 mb-4">
        <p>Starts: {formatDateTime(event.start_time)}</p>
        <p>Ends: {formatDateTime(event.end_time)}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm">
          <div>True Bets: {trueBets} coins</div>
          <div>Payout: {falseBets ? (falseBets / trueBets + 1).toFixed(2) : '2.00'}x</div>
        </div>
        <Button 
          onClick={handleBetClick}
          variant="secondary"
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          Apostar
        </Button>
        <div className="text-sm text-right">
          <div>False Bets: {falseBets} coins</div>
          <div>Payout: {trueBets ? (trueBets / falseBets + 1).toFixed(2) : '2.00'}x</div>
        </div>
      </div>
    </div>
  );
} 