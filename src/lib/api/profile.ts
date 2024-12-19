import { Profile } from '@/types/profile';
import { supabase } from '../supabaseClient';

export const profileService = {
  async fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getSignedAvatarUrl(avatarPath: string) {
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl(avatarPath, 3600);

    if (error) throw error;
    return data.signedUrl;
  }
}; 