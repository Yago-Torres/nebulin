"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react"; // Import the bell icon from lucide-react

interface LeagueInvite {
  id: string;
  league_id: string;
  league: {
    name: string;
  };
  invited_by: string;
  inviter: {
    username: string;
  };
  status: string;
}

export default function InvitesPopup() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<LeagueInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && open) {
      loadInvites();
    }
  }, [user, open]);

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('league_invites')
        .select(`
          id,
          league_id,
          leagues!league_invites_league_id_fkey(name),
          invited_by,
          profiles!league_invites_invited_by_fkey(username)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading invites:', error.message);
        return;
      }

      // Transform the data to match our interface
      const transformedData = data?.map(invite => ({
        id: invite.id,
        league_id: invite.league_id,
        league: invite.leagues,
        invited_by: invite.invited_by,
        inviter: invite.profiles
      })) || [];

      setInvites(transformedData);
    } catch (err) {
      console.error('Failed to load invites:', err);
    }
  };

  const handleInvite = async (inviteId: string, accept: boolean) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('league_invites')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      if (accept) {
        const invite = invites.find(i => i.id === inviteId);
        if (!invite) throw new Error('Invite not found');

        const { error: memberError } = await supabase
          .from('league_members')
          .insert({
            league_id: invite.league_id,
            user_id: user?.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      toast.success(accept ? 'Invitación aceptada' : 'Invitación rechazada');
      loadInvites();
    } catch (error) {
      console.error('Error handling invite:', error);
      toast.error('Error al procesar la invitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {invites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {invites.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg" 
        align="end"
      >
        <div className="p-4">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Invitaciones a Ligas
          </h3>
          {invites.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tienes invitaciones pendientes
            </p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {invites.map((invite) => (
                <div key={invite.id} 
                  className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {invite.league?.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Invitado por: {invite.inviter?.username}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInvite(invite.id, true)}
                        disabled={loading}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleInvite(invite.id, false)}
                        disabled={loading}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}