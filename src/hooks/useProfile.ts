import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types/profile';
import { toast } from 'react-toastify';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data?.avatar_url) {
        try {
          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('avatars')
            .createSignedUrl(data.avatar_url, 3600);

          if (signedUrlError) throw signedUrlError;
          if (signedUrlData) setAvatarUrl(signedUrlData.signedUrl);
        } catch (urlError) {
          console.error('Error getting signed URL:', urlError);
          setAvatarUrl(null);
        }
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Error al obtener los datos del perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return { profile, avatarUrl, loading, refetchProfile: fetchProfile };
} 