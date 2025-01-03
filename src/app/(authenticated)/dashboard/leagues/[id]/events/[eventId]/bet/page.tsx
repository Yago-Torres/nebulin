"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface LeagueMemberBets {
  id: string;
  user_id: string;
  profiles: {
    username: string;
  };
  bets: {
    amount: number;
    prediction_equal_true: boolean;
    created_at: string;
  }[];
}

export default function BetPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingBet, setPendingBet] = useState<{prediction: boolean, amount: number} | null>(null);
  const [predictionEqualTrue, setPredictionEqualTrue] = useState<boolean | null>(null);
  const [memberBets, setMemberBets] = useState<LeagueMemberBets[]>([]);
  const [totalTrue, setTotalTrue] = useState(0);
  const [totalFalse, setTotalFalse] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  const eventId = pathname?.split('/').filter(Boolean)[4]; // Get event ID from URL

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        toast.error("Error al cargar el evento");
        return;
      }

      // Check if event has ended
      if (new Date(data.end_time) <= new Date()) {
        toast.error("Este evento ha finalizado y no acepta más apuestas");
        router.back();
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    fetchEvent();
  }, [user, authLoading, router, eventId]);

  useEffect(() => {
    if (!eventId) return;
    
    const fetchLeagueMemberBets = async () => {
      // First get the league_id from the pathname
      const leagueId = pathname?.split('/')[3];

      const { data, error } = await supabase
        .from('league_members')
        .select(`
          id,
          user_id,
          profiles (
            username
          ),
          bets (
            amount,
            prediction_equal_true,
            created_at
          )
        `)
        .eq('league_id', leagueId)
        .eq('bets.event_id', eventId);

      if (error) {
        console.error('Error fetching member bets:', error);
        return;
      }

      console.log('Raw data:', data);
      setMemberBets(data || []);

      // Calculate totals from all bets
      const allBets = data?.flatMap(member => member.bets || []) || [];
      const trueTotal = allBets
        .filter(bet => bet.prediction_equal_true)
        .reduce((sum, bet) => sum + bet.amount, 0);
      const falseTotal = allBets
        .filter(bet => !bet.prediction_equal_true)
        .reduce((sum, bet) => sum + bet.amount, 0);

      setTotalTrue(trueTotal);
      setTotalFalse(falseTotal);
    };

    fetchLeagueMemberBets();
  }, [eventId]);

  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        const { data, error } = await supabase
          .from('users_balance')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserBalance(data.balance);
        }
      };

      fetchBalance();
    }
  }, [user]);

  const handleBet = async (prediction: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error("Debes iniciar sesión para apostar");
        return;
      }

      if (betAmount < 10) {
        toast.error("La apuesta mínima es de 10 nebulines");
        return;
      }

      // Get league_id from pathname
      const leagueId = pathname?.split('/')[3];

      // First check if user has enough balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('users_balance')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (balanceError || !balanceData) {
        toast.error("Error al verificar el saldo");
        setIsSubmitting(false);
        return;
      }

      if (balanceData.balance < betAmount) {
        toast.error("No tienes suficientes nebulines");
        setIsSubmitting(false);
        return;
      }

      // Check if user is a league member
      const { error: memberError } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        toast.error("No eres miembro de esta liga");
        setIsSubmitting(false);
        return;
      }

      // Place the bet and update balance in a transaction
      const { error: transactionError } = await supabase.rpc('place_bet', {
        p_user_id: user.id,
        p_event_id: eventId,
        p_amount: Number(betAmount),
        p_prediction: prediction,
        p_league_id: leagueId
      });

      if (transactionError) throw transactionError;

      toast.success("Apuesta realizada correctamente");
      router.push(`/dashboard/leagues/${leagueId}`);
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error("Error al realizar la apuesta");
      setIsSubmitting(false);
    }
  };

  const calculatePotentialPayout = (betAmount: number, totalForSide: number, totalAgainstSide: number) => {
    if (totalAgainstSide === 0) return betAmount * 2; // Default 2x if no opposing bets
    
    // Calculate the potential win, capped at betAmount
    const potentialWin = Math.min(
      betAmount,
      (betAmount / totalForSide) * totalAgainstSide
    );
    
    // Return original bet + winnings
    return betAmount + potentialWin;
  };

  if (loading || authLoading) {
    return <p className="p-4 text-center">Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Apuestas del Evento</h1>
        <Button variant="secondary" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg mb-6">
        <h2 className="text-gray-100 text-xl font-semibold mb-2">{event?.title}</h2>
        <p className="text-gray-200 mb-4">{event?.description}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Resumen de Apuestas</h2>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-4">Cantidad a Apostar</h2>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex flex-col gap-3">
              <label className="text-gray-100 text-lg font-medium">Nebulines a apostar</label>
              <div className="flex items-center gap-4">
                <Input
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-40 bg-gray-800 border-gray-700 text-gray-100"
                />
                <span className="text-gray-300">mínimo 10 nebulines</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setPendingBet({ prediction: true, amount: betAmount });
              setShowConfirmation(true);
            }}
            disabled={betAmount > userBalance}
            className={`bg-green-900/20 p-4 rounded-lg hover:bg-green-900/30 transition-colors group relative ${
              betAmount > userBalance ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-green-500/20"></div>
            <h3 className="text-lg font-medium text-green-600">Apuestas "Sí"</h3>
            <p className="text-2xl font-bold">{totalTrue} nebulines</p>
            <p className="text-sm text-gray-600">
              Pago potencial: {calculatePotentialPayout(betAmount, totalTrue, totalFalse).toFixed(2)} nebulines
            </p>
          </button>
          
          <button
            onClick={() => {
              setPendingBet({ prediction: false, amount: betAmount });
              setShowConfirmation(true);
            }}
            disabled={betAmount > userBalance}
            className={`bg-red-900/20 p-4 rounded-lg hover:bg-red-900/30 transition-colors group relative ${
              betAmount > userBalance ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-red-500/20"></div>
            <h3 className="text-lg font-medium text-red-600">Apuestas "No"</h3>
            <p className="text-2xl font-bold">{totalFalse} nebulines</p>
            <p className="text-sm text-gray-600">
              Pago potencial: {calculatePotentialPayout(betAmount, totalFalse, totalTrue).toFixed(2)} nebulines
            </p>
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Saldo disponible: {userBalance} nebulines
        </div>

        {showConfirmation && pendingBet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Confirmar Apuesta</h3>
              <p className="mb-4">
                ¿Estás seguro que quieres apostar {pendingBet.amount} nebulines a 
                &quot;{pendingBet.prediction ? 'Sí' : 'No'}&quot; para el evento 
                &quot;{event?.title}&quot;?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowConfirmation(false);
                    setPendingBet(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleBet(pendingBet.prediction);
                    setShowConfirmation(false);
                    setPendingBet(null);
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Procesando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2 text-gray-100">Historial de Apuestas</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-800">
                  <TableHead className="text-gray-200 font-semibold py-3">Usuario</TableHead>
                  <TableHead className="text-gray-200 font-semibold py-3">Predicción</TableHead>
                  <TableHead className="text-gray-200 font-semibold py-3">Cantidad</TableHead>
                  <TableHead className="text-gray-200 font-semibold py-3">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberBets.map((member) => (
                  <TableRow 
                    key={member.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <TableCell className="py-3 text-gray-300">{member.profiles?.username}</TableCell>
                    <TableCell className="py-3">
                      {member.bets?.length ? 
                        <span className="text-green-100">Ha apostado</span> : 
                        <span className="text-gray-100">Sin apuesta</span>
                      }
                    </TableCell>
                    <TableCell className="py-3 text-gray-300">
                      {member.bets?.[0]?.amount ? `${member.bets[0].amount} nebulines` : '-'}
                    </TableCell>
                    <TableCell className="py-3 text-gray-300">
                      {member.bets?.[0]?.created_at ? 
                        new Date(member.bets[0].created_at).toLocaleString() : 
                        '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {memberBets.length === 0 && (
                  <TableRow>
                    <TableCell 
                      colSpan={4} 
                      className="text-center py-4 text-gray-400"
                    >
                      No hay apuestas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
} 