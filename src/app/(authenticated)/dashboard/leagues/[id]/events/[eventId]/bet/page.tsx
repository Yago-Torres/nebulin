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
  const [predictionEqualTrue, setPredictionEqualTrue] = useState<boolean | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [memberBets, setMemberBets] = useState<LeagueMemberBets[]>([]);
  const [totalTrue, setTotalTrue] = useState(0);
  const [totalFalse, setTotalFalse] = useState(0);

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

  const handleBet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (betAmount < 10) {
      toast.error("La apuesta mínima es de 10 nebulines");
      return;
    }

    if (predictionEqualTrue === null) {
      toast.error("Debes seleccionar si la predicción se cumplirá o no");
      return;
    }

    try {
      const { error } = await supabase
        .from('bets')
        .insert([
          {
            event_id: eventId,
            user_id: user?.id,
            prediction_equal_true: predictionEqualTrue,
            amount: betAmount,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      toast.success("Apuesta realizada correctamente");
      router.back();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error("Error al realizar la apuesta");
    }
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
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-400">Apuestas "Sí"</h3>
            <p className="text-2xl font-bold">{totalTrue} nebulines</p>
            <p className="text-sm text-gray-400">
              Pago potencial: {totalFalse ? (totalFalse / totalTrue + 1).toFixed(2) : '2.00'}x
            </p>
          </div>
          
          <div className="bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-red-400">Apuestas "No"</h3>
            <p className="text-2xl font-bold">{totalFalse} nebulines</p>
            <p className="text-sm text-gray-400">
              Pago potencial: {totalTrue ? (totalTrue / totalFalse + 1).toFixed(2) : '2.00'}x
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Predicción</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberBets.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.profiles?.username}</TableCell>
                  <TableCell>
                    {member.bets?.length ? 
                      <span className="text-green-400">Ha apostado</span> : 
                      <span className="text-gray-400">Sin apuesta</span>
                    }
                  </TableCell>
                  <TableCell>
                    {member.bets?.[0] && (
                      <span className={member.bets[0].prediction_equal_true ? 'text-green-400' : 'text-red-400'}>
                        {member.bets[0].prediction_equal_true ? 'Sí' : 'No'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.bets?.[0]?.amount ? `${member.bets[0].amount} nebulines` : '-'}
                  </TableCell>
                  <TableCell>
                    {member.bets?.[0]?.created_at ? 
                      new Date(member.bets[0].created_at).toLocaleString() : 
                      '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
} 