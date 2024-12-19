import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { formatDateTime } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    result: boolean;
    resolved_at: string;
    created_by: string;
  };
}

export function Event({ event }: EventProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [trueBets, setTrueBets] = useState(0);
  const [falseBets, setFalseBets] = useState(0);
  const { user } = useAuth();
  const [isResolving, setIsResolving] = useState(false);

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

    const trueSum = bets?.filter(bet => bet.prediction_equal_true).reduce((sum, bet) => sum + bet.amount, 0) || 0;
    const falseSum = bets?.filter(bet => !bet.prediction_equal_true).reduce((sum, bet) => sum + bet.amount, 0) || 0;

    setTrueBets(trueSum);
    setFalseBets(falseSum);
  };

  const handleBetClick = () => {
    const leagueId = pathname?.split('/')[3];
    router.push(`/dashboard/leagues/${leagueId}/events/${event.id}/bet`);
  };

  const handleResolve = async (result: boolean) => {
    setIsResolving(true);
    try {
      const { error } = await supabase.rpc('resolve_event', {
        p_event_id: event.id,
        p_result: result
      });

      if (error) throw error;
      toast.success("Evento resuelto correctamente");
      
      // Get league_id from pathname
      const leagueId = pathname?.split('/')[3];
      
      // Refresh and redirect
      router.refresh();
      router.push(`/dashboard/leagues/${leagueId}`);
    } catch (error) {
      console.error('Error resolving event:', error);
      toast.error("Error al resolver el evento");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        {event.resolved_at && (
          <span className={`px-2 py-1 rounded text-sm ${
            event.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {event.result ? 'Verdadero' : 'Falso'}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
      <div className="text-sm text-gray-500 mb-4">
        <p>Inicia: {formatDateTime(event.start_time)}</p>
        <p>Termina: {formatDateTime(event.end_time)}</p>
        {event.resolved_at && (
          <p>Resuelto: {formatDateTime(event.resolved_at)}</p>
        )}
      </div>
      
      {!event.resolved_at && new Date(event.end_time) > new Date() ? (
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <div>Apuestas Sí: {trueBets} nebulines</div>
            <div>Pago: {falseBets ? (falseBets / trueBets + 1).toFixed(2) : '2.00'}x</div>
          </div>
          <Button 
            onClick={handleBetClick}
            variant="secondary"
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Apostar
          </Button>
          <div className="text-sm text-right">
            <div>Apuestas No: {falseBets} nebulines</div>
            <div>Pago: {trueBets ? (trueBets / falseBets + 1).toFixed(2) : '2.00'}x</div>
          </div>
        </div>
      ) : !event.resolved_at ? (
        <div className="text-center">
          <p className="text-amber-600 mb-2">
            Evento finalizado, pendiente de resolución
          </p>
          {user?.id === event.created_by && (
            <div className="flex gap-2 justify-center mt-2">
              <Button
                onClick={() => handleResolve(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isResolving}
              >
                {isResolving ? "Resolviendo..." : "Resolver como Verdadero"}
              </Button>
              <Button
                onClick={() => handleResolve(false)}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isResolving}
              >
                {isResolving ? "Resolviendo..." : "Resolver como Falso"}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
} 