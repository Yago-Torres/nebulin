"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image";
import { logger } from "@/utils/logger";  // Add this import
import { Avatar } from "@/components/ui/Avatar";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
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

  const loadAvatarUrls = async (profiles: Profile[]) => {
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

  const handleSearch = async () => {
    if (!user) return;
    
    if (searchTerm.length < 2) {
      toast.info("Ingresa al menos 2 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data: searchData, error: searchError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${searchTerm}%`)
        .not('id', 'eq', user.id)
        .limit(10);

      if (searchError) throw searchError;
      
      if (searchData) {
        setSearchResults(searchData);
        await loadAvatarUrls(searchData);
      }
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast.error("Error al buscar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user?.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) throw error;
      toast.success("Solicitud de amistad enviada");
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error("Error al enviar solicitud");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buscar Usuarios</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          type="text"
          placeholder="Buscar por nombre de usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>


      <div className="grid gap-4">
        {searchResults.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg flex items-center gap-4">
            <Avatar url={avatarUrls[profile.id]} username={profile.username} size={50} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.username}</h3>
              {profile.bio && <p className="text-gray-500 dark:text-gray-400">{profile.bio}</p>}
            </div>
            <Button onClick={() => sendFriendRequest(profile.id)}>
              Agregar Amigo
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 