import { LoginForm } from "@/components/login-form";
import { JSX, useState } from "react";

export interface LoginFormProps {
  email: string;
  password: string;
  className?: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Email:", email, "Password:", password);
    // Reset form fields after submission
    setEmail("");
    setPassword("");
  };
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm
          onSubmit={handleSubmit}
          setPassword={setPassword}
          setEmail={setEmail}
          email={email}
          password={password}
        />
      </div>
    </div>
  );
}
