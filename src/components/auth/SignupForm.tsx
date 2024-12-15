// src/components/auth/SignupForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "react-toastify";
import { Button } from "../ui/button"; // Import Button from shadcn/ui
import { Input } from "../ui/input"; // Import Input from shadcn/ui
import styles from "./AuthForm.module.css";

// Type for form inputs
interface SignupFormInputs {
  email: string;
  password: string;
}

// Type for SignupForm Props
interface SignupFormProps {
  onSignup?: () => void;  // Optional callback prop
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>();
  const [loading, setLoading] = useState(false);

  // Form submit handler
  const onSubmit = async (data: SignupFormInputs) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
    }
     else {
      toast.success("Registro exitoso! Revisa tu email para confirmar.");
      if (onSignup) {
        onSignup();  // Call the callback if provided
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
      <h2 className="text-2xl font-semibold mb-4">Registrarse</h2>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-1">Email:</label>
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
        <label htmlFor="password" className="block mb-1">Contraseña:</label>
        <Input
          id="password"
          type="password"
          placeholder="Tu contraseña"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: {
              value: 6,
              message: "La contraseña debe tener al menos 6 caracteres",
            },
          })}
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
};

export default SignupForm;
