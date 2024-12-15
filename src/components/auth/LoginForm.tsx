import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import styles from "./AuthForm.module.css";

interface LoginFormInputs {
  email: string;
  password: string;
}

// Add a prop type for onLogin
interface LoginFormProps {
  onLogin?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inicio de sesión exitoso!");
      // If onLogin is provided, call it after a successful login
      if (onLogin) {
        onLogin();
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
      <h2 className="text-2xl font-semibold mb-4">Iniciar Sesión</h2>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">
          Email:
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tuemail@ejemplo.com"
          {...register("email", { required: "El email es obligatorio" })}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block mb-1">
          Contraseña:
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Tu contraseña"
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
        />
        {errors.password && (
          <span className="text-red-500 text-sm">{errors.password.message}</span>
        )}
      </div>
      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? "Iniciando..." : "Iniciar Sesión"}
      </Button>
    </form>
  );
};

export default LoginForm;
