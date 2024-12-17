"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface FormInputs {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

const schema = yup.object({
  title: yup
    .string()
    .required("El título es obligatorio")
    .min(3, "El título debe tener al menos 3 caracteres"),
  description: yup
    .string()
    .required("La descripción es obligatoria")
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  start_time: yup
    .string()
    .required("La fecha de inicio es obligatoria"),
  end_time: yup
    .string()
    .required("La fecha de fin es obligatoria")
    .test("is-after-start", "La fecha de fin debe ser posterior a la de inicio", function(value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      return new Date(value) > new Date(start_time);
    }),
}).required();

export default function CreateEventPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const leagueId = pathname?.split('/').filter(Boolean)[2]; // Get league ID from URL

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: FormInputs) => {
    try {
      const { error } = await supabase
        .from('events')
        .insert([
          {
            league_id: leagueId,
            title: data.title,
            description: data.description,
            start_time: new Date(data.start_time).toISOString(),
            end_time: new Date(data.end_time).toISOString(),
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;

      toast.success("Evento creado correctamente");
      router.push(`/dashboard/leagues/${leagueId}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Error al crear el evento");
    }
  };

  if (authLoading) {
    return <p className="p-4 text-center">Cargando...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Evento</h1>
        <Button variant="secondary" onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título</label>
          <Input {...register("title")} />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <Textarea {...register("description")} />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha de inicio</label>
          <Input type="datetime-local" {...register("start_time")} />
          {errors.start_time && (
            <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fecha de fin</label>
          <Input type="datetime-local" {...register("end_time")} />
          {errors.end_time && (
            <p className="text-red-500 text-sm mt-1">{errors.end_time.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear Evento"}
        </Button>
      </form>
    </div>
  );
} 