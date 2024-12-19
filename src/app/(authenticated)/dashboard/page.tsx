// src/app/dashboard.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { League } from "@/types";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchLeagues();
    }
  }, [user, isLoading, router]);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*, league_members!inner(*)')
        .eq('league_members.user_id', user?.id);

      if (error) throw error;

      const formattedLeagues: League[] = data.map(league => ({
        id: league.id,
        name: league.name,
        description: league.description,
        created_at: league.created_at,
        created_by: league.created_by,
        member_count: league.member_count || 0
      }));

      setLeagues(formattedLeagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return <p className="p-4 text-center dark:text-white">Cargando...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Mis Ligas</h1>
      </div>

      {leagues.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No estás en ninguna liga</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Crea o únete a una liga para empezar</p>
          <Link href="/create-league">
            <Button>Crear Liga</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {leagues.map((league) => (
              <div
                key={league.id}
                onClick={() => router.push(`/dashboard/leagues/${league.id}`)}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="text-lg font-semibold mb-2 dark:text-white">{league.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{league.description}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {league.member_count} miembros
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-6 right-6">
            <Link href="/create-league">
              <Button className="rounded-full w-12 h-12 p-0">
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
