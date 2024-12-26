"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "react-toastify";
import { Avatar } from "@/components/ui/Avatar";

interface Friend {
  id: string;
  status: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface PendingRequest {
  id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export default function FriendsList() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  const getSignedUrl = async (avatarPath: string) => {
    try {
      const folderName = avatarPath.includes('avatars/') 
        ? avatarPath.split('avatars/')[1].split('/')[0]
        : avatarPath;
      
      const filePath = `${folderName}/avatar.png`;
      console.log('Requesting signed URL for path:', filePath);
      
      const { data, error } = await supabase
        .storage
        .from('avatars')
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const loadAvatarUrls = async (profiles: { id: string, avatar_url: string | null }[]) => {
    const urls: Record<string, string> = {};
    for (const profile of profiles) {
      if (profile.avatar_url) {
        const signedUrl = await getSignedUrl(profile.avatar_url);
        if (signedUrl) {
          urls[profile.id] = signedUrl;
        }
      }
    }
    setAvatarUrls(urls);
  };

  const fetchFriends = async () => {
    if (!user) return;
    
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          profiles!friends_friend_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      const { data: pendingData, error: pendingError } = await supabase
        .from('friends')
        .select(`
          id,
          profiles!friends_user_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      setFriends(friendsData || []);
      setPendingRequests(pendingData || []);

      const allProfiles = [
        ...(pendingData?.map(r => r.profiles) || []),
        ...(friendsData?.map(f => f.profiles) || [])
      ];
      await loadAvatarUrls(allProfiles);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Error al cargar los amigos');
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const handleRequest = async (friendshipId: string, accept: boolean) => {
    try {
      if (accept) {
        const { error } = await supabase
          .from('friends')
          .update({ status: 'accepted' })
          .eq('id', friendshipId);

        if (error) throw error;
        toast.success("Solicitud aceptada");
      } else {
        const { error } = await supabase
          .from('friends')
          .delete()
          .eq('id', friendshipId);

        if (error) throw error;
        toast.success("Solicitud rechazada");
      }
      fetchFriends();
    } catch (error) {
      console.error('Error handling friend request:', error);
      toast.error("Error al procesar la solicitud");
    }
  };

  return (
    <div className="space-y-4">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Solicitudes Pendientes</h3>
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center gap-2 p-2">
              <Avatar 
                url={avatarUrls[request.profiles.id] || null}
                username={request.profiles.username}
                size={32}
              />
              <span>{request.profiles.username}</span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  onClick={() => handleRequest(request.id, true)}
                >
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRequest(request.id, false)}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Amigos</h3>
        {friends.map((friend) => (
          <div key={friend.id} className="flex items-center gap-2 p-2">
            <Avatar 
              url={avatarUrls[friend.profiles.id] || null}
              username={friend.profiles.username}
              size={32}
            />
            <span>{friend.profiles.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}