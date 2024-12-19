// src/app/dashboard/account/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  }
  

interface FormInputs {
  username: string;
  bio?: string;
  avatar?: FileList;
}


const schema = yup.object({
  username: yup
    .string()
    .required("El nombre de usuario es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  bio: yup
    .string()
    .max(300, "La biografía no puede exceder los 300 caracteres"),
  avatar: yup
    .mixed<FileList>()
    .test("fileSize", "El archivo es demasiado grande (máx. 2MB)", (value) => {
      if (!value || value.length === 0) return true; // Allow no file
      return value[0].size <= 2000000; // 2MB
    })
    .test("fileType", "Tipo de archivo no soportado", (value) => {
      if (!value || value.length === 0) return true; // Allow no file
      return ["image/jpeg", "image/png", "image/gif"].includes(value[0].type);
    }),
}).required();

const supabaseLoader = ({ src }: { src: string }) => {
  return src;
};

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login"); // Redirect unauthenticated users
    } else if (user) {
      fetchProfile();
    }
  }, [user, isLoading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data?.avatar_url) {
        try {
          // Extract just the file path from the full URL
          const filePath = data.avatar_url.replace(/^.*\/avatars\//, '');
          console.log('Requesting signed URL for path:', filePath); // Debug log

          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('avatars')
            .createSignedUrl(filePath, 3600);

          if (signedUrlError) {
            throw signedUrlError;
          }

          if (signedUrlData) {
            setAvatarUrl(signedUrlData.signedUrl);
          }
        } catch (urlError) {
          console.error('Error getting signed URL:', urlError);
          setAvatarUrl(null);
        }
      } else {
        setAvatarUrl(null);
      }

      setProfile(data);
      setValue("username", data.username || "");
      setValue("bio", data.bio || "");
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Error al obtener los datos del perfil.");
    }
  };

  // Add a useEffect to refresh the signed URL periodically
  useEffect(() => {
    if (profile?.avatar_url) {
      // Refresh the signed URL every 45 minutes
      const interval = setInterval(() => {
        fetchProfile();
      }, 45 * 60 * 1000); // 45 minutes in milliseconds

      return () => clearInterval(interval);
    }
  }, [profile?.avatar_url]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setLoading(true);

    let avatar_url = profile?.avatar_url || "";

    if (data.avatar && data.avatar.length > 0) {
      const file = data.avatar[0];
      const folderName = crypto.randomUUID(); // Generate a unique folder name
      const filePath = `${folderName}/avatar.png`;

      try {
        // Upload the file
        const { error: uploadError } = await supabase
          .storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            cacheControl: '3600',
            contentType: file.type,
          });

        if (uploadError) throw uploadError;
        
        avatar_url = folderName; // Store the folder name as the avatar_url

      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Error al subir el avatar.");
        setLoading(false);
        return;
      }
    }

    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({
        username: data.username,
        bio: data.bio,
        avatar_url: avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user?.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil.");
    } else {
      toast.success("Perfil actualizado correctamente.");
      setIsEditModalOpen(false);
      fetchProfile();
    }

    setLoading(false);
  };

  if (isLoading || !user) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Mi Cuenta</h1>
        <Button 
          onClick={() => setIsEditModalOpen(true)}
          variant="primary"
        >
          Editar Perfil
        </Button>
      </div>

      {profile ? (
        <div className="space-y-6">
          <div className="relative w-[100px] h-[100px] bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  console.error('Image failed to load:', avatarUrl);
                  setAvatarUrl(null);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <span className="text-gray-400 dark:text-gray-500">No avatar</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre de Usuario</h3>
              <p className="mt-1 text-lg dark:text-white">{profile.username}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Biografía</h3>
              <p className="mt-1 text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                {profile.bio || "Sin biografía"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
              <p className="mt-1 text-gray-900 dark:text-gray-200">{user?.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="dark:text-gray-300">Cargando información del perfil...</p>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 sm:max-w-[425px] text-gray-900 dark:text-gray-100">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold dark:text-white">
              Editar Perfil
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Actualiza tu información de perfil aquí.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de Usuario
              </label>
              <Input
                id="username"
                type="text"
                {...register("username")}
                placeholder="Tu nombre de usuario"
                className="mt-1 block w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {errors.username && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Biografía
              </label>
              <textarea
                id="bio"
                {...register("bio")}
                placeholder="Cuéntanos sobre ti..."
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
              {errors.bio && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.bio.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Avatar
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                {...register("avatar")}
                className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
              />
              {errors.avatar && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.avatar.message}</p>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

