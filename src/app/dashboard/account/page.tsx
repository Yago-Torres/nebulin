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


export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    const { data, error } = await supabase
        .from<Profile>('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();


    if (error) {
      if (error.code === 'PGRST116') {
        // No profile exists, create one
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user?.id,
              username: null,
              avatar_url: null,
              bio: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]).select();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          toast.error("Error al crear el perfil.");
        } else {
          setProfile(insertData[0]);
          setValue("username", insertData[0].username || "");
          setValue("bio", insertData[0].bio || "");
          toast.success("Perfil creado correctamente.");
        }
      } else {
        console.error("Error fetching profile:", error);
        toast.error("Error al obtener los datos del perfil.");
      }
    } else {
      setProfile(data);
      setValue("username", data.username || "");
      setValue("bio", data.bio || "");
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setLoading(true);

    let avatar_url = profile?.avatar_url || "";

    // Handle avatar upload if a new file is selected
    if (data.avatar && data.avatar.length > 0) {
      const file = data.avatar[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;


      try {
        // Upload the file to Supabase Storage with metadata
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true,
            cacheControl: '3600',
            contentType: file.type,
            metadata: {
              user_id: user?.id, // Ensure this matches auth.uid()
            },
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicData } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (publicData) {
          avatar_url = publicData.publicUrl;
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Error al subir el avatar.");
        setLoading(false);
        return;
      }
    }

    // Update the profile in the database
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
      fetchProfile(); // Refresh profile data
    }

    setLoading(false);
  };

  if (isLoading || !user) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Mi Cuenta</h1>

      {profile ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre de Usuario
            </label>
            <Input
              id="username"
              type="text"
              {...register("username")}
              placeholder="Tu nombre de usuario"
              className="mt-1 block w-full"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Biografía
            </label>
            <textarea
              id="bio"
              {...register("bio")}
              placeholder="Cuéntanos sobre ti..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          {/* Avatar Upload Field */}
          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
              Avatar
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              {...register("avatar")}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>
            )}
            {/* Display Current Avatar */}
            {profile.avatar_url ? (
              <div className="mt-2">
                <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              </div>
            ) : (
              <div className="mt-2 w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Avatar</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Perfil"}
            </Button>
          </div>
        </form>
      ) : (
        <p>No se pudo cargar el perfil.</p>
      )}
    </div>
  );
}
