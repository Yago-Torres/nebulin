"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Event } from "@/components/Event";

interface League {
  id: string;
  name: string;
  description: string;
  created_at: string;
  created_by: string;
  member_count: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

export default function LeaguePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [league, setLeague] = useState<League | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const leagueId = pathname?.split('/').filter(Boolean).pop();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && leagueId && leagueId !== 'dashboard') {
      fetchLeagueAndEvents();
    }
  }, [user, authLoading, leagueId, router]);

  const fetchLeagueAndEvents = async () => {
    try {
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('league_id', leagueId);

      if (eventsError) throw eventsError;

      setLeague(leagueData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <p className="p-4 text-center">Cargando...</p>;
  }

  if (!league) {
    return <p className="p-4 text-center">Liga no encontrada</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-gray-600">{league.description}</p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No hay eventos activos</h2>
            <p className="text-gray-600 mb-4">Crea un nuevo evento para empezar</p>
          </div>
        ) : (
          events.map((event) => (
            <Event key={event.id} event={event} />
          ))
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={() => router.push(`/dashboard/leagues/${leagueId}/create-event`)}
          className="flex items-center gap-2 px-6 py-2 rounded-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Añadir evento</span>
        </Button>
      </div>
    </div>
  );
}