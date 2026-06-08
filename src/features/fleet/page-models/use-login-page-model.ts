import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/AuthProvider";

export function useLoginPageModel() {
  const { session, signIn, isSupabaseReady } = useAuth();
  const [email, setEmail] = useState("ops@bytebeam.local");
  const [password, setPassword] = useState("bytebeam-demo");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    session,
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isSupabaseReady,
    handleSubmit,
  };
}
