"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { authSchema } from "@/lib/validators";

const loginSchema = authSchema.pick({ email: true, password: true });
const signupSchema = authSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be 80 characters or fewer."),
});

type AuthValues = {
  name?: string;
  email: string;
  password: string;
};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { toast, updateToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const schema = mode === "signup" ? signupSchema : loginSchema;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: AuthValues) {
    setError("");
    const toastId = toast({
      title: mode === "login" ? "Signing you in" : "Creating workspace",
      description: mode === "login" ? "Checking your Peblo credentials." : "Setting up your Peblo Notes account.",
      status: "loading",
    });

    if (mode === "signup") {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const data = await response.json();
        const message = data.error ?? "Unable to create account.";
        setError(message);
        updateToast(toastId, { title: "Signup failed", description: message, status: "error" });
        return;
      }
    }

    const result = await signIn("credentials", { email: values.email, password: values.password, redirect: false });
    if (result?.error) {
      const message = "Email or password is incorrect.";
      setError(message);
      updateToast(toastId, { title: "Login failed", description: message, status: "error" });
      return;
    }
    updateToast(toastId, {
      title: mode === "login" ? "Welcome back" : "Workspace ready",
      description: "Opening your Peblo dashboard.",
      status: "success",
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {mode === "signup" ? (
        <FieldError id="name-error" message={errors.name?.message}>
          <Input
            placeholder="Full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </FieldError>
      ) : null}
      <FieldError id="email-error" message={errors.email?.message}>
        <Input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
      </FieldError>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[var(--peblo-muted)] hover:bg-[var(--peblo-purple-soft)]"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors.password?.message ? <p id="password-error" className="-mt-2 text-sm font-medium text-rose-700">{errors.password.message}</p> : null}
      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
        {mode === "login" ? "Log in" : "Create account"}
      </Button>
      <p className="text-center text-sm text-[var(--peblo-muted)]">
        {mode === "login" ? "New to Peblo?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-bold text-[var(--peblo-purple-deep)]">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>
    </form>
  );
}

function FieldError({ children, id, message }: { children: React.ReactNode; id: string; message?: string }) {
  return (
    <div className="grid gap-1">
      {children}
      {message ? <p id={id} className="text-sm font-medium text-rose-700">{message}</p> : null}
    </div>
  );
}
