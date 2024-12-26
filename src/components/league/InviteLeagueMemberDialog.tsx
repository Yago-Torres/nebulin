"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  username: string;
}

interface Friend {
  id: string;
  friend: Profile;
}

export default function InviteLeagueMemberDialog({ leagueId }: { leagueId: string }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadFriends();
    }
  }, [open, user]);

  const loadFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          profiles!friends_friend_id_fkey (
            id,
            username
          )
        `)
        .or(`user_id.eq.${user?.id},friend_id.eq.${user?.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Transform the data to get just the friend profiles
      const friendProfiles = data.map((friend: any) => friend.profiles);
      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', `%${query}%`)
      .limit(5);

    if (error) {
      console.error('Error searching users:', error);
      return;
    }

    setResults(data || []);
  };

  const inviteUser = async (userId: string) => {
    setLoading(true);
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        toast.error('Este usuario ya es miembro de la liga');
        return;
      }

      // Check if there's already a pending invite
      const { data: existingInvite } = await supabase
        .from('league_invites')
        .select('id')
        .eq('league_id', leagueId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        toast.error('Ya existe una invitación pendiente para este usuario');
        return;
      }

      // Create the invite
      const { error: inviteError } = await supabase
        .from('league_invites')
        .insert({
          league_id: leagueId,
          user_id: userId,
          invited_by: user?.id,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast.success('Invitación enviada');
      setOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  const renderUserList = (users: Profile[]) => (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {users.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        >
          <span className="text-gray-900 dark:text-white">{profile.username}</span>
          <Button
            size="sm"
            onClick={() => inviteUser(profile.id)}
            disabled={loading}
          >
            Invitar
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar Miembro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Invitar a la Liga</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Buscar Usuario</TabsTrigger>
            <TabsTrigger value="friends">Amigos</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="space-y-4 py-4">
            <Input
              placeholder="Buscar usuario por nombre..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchUsers(e.target.value);
              }}
              className="bg-gray-50 dark:bg-gray-800"
            />
            {renderUserList(results)}
          </TabsContent>
          <TabsContent value="friends" className="space-y-4 py-4">
            {friends.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No tienes amigos agregados
              </p>
            ) : (
              renderUserList(friends)
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 