export interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  // ... otros campos
}

export interface FormInputs {
  username: string;
  bio: string;
  // ... otros campos del formulario
} 