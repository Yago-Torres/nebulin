"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import Image from "next/image";

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

  const handleSearch = async () => {
    if (searchTerm.length < 3) {
      toast.info("Ingresa al menos 3 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${searchTerm}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
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
          <div key={profile.id} className="bg-gray-900 p-4 rounded-lg flex items-center gap-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={50}
                height={50}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-700 rounded-full" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{profile.username}</h3>
              {profile.bio && <p className="text-gray-400">{profile.bio}</p>}
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