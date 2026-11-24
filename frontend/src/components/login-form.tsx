"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useAuthStore } from "@/src/store/useAuthStore";
import { ConsentAgreement } from "@/src/components/consent-agreement";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  acceptedLegal: z.boolean().refine((value) => value, {
    message: "Confirme a leitura e aceite os documentos para continuar.",
  }),
});

export const LoginForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", acceptedLegal: false },
  });

  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { email, password } = data;
    setIsLoading(true);

    try {
      const result = await login(email, password, data.acceptedLegal);

      if (result.success) {
        toast.success("Login realizado com sucesso! Bem-vindo de volta.");

        const destination = result.role === 'GESTOR' ? '/dashboard' : '/homepage-denunciante';
        window.location.replace(destination);
      } else {
        const errorMsg = result.error || "";
        if (errorMsg.toLowerCase().includes("invalid credentials") || errorMsg.toLowerCase().includes("invalid login credentials")) {
          toast.error("E-mail ou senha incorretos. Por favor, verifique seus dados.");
        } else {
          toast.error(errorMsg || "Não foi possível realizar o login. Tente novamente.");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao fazer login. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Entrar</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-stone-100 h-12"
                    placeholder="seu.email@mail.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acceptedLegal"
            render={({ field, fieldState }) => (
              <FormItem>
                <ConsentAgreement
                  checked={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    className="bg-stone-100 h-12"
                    type="password"
                    placeholder="******"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-sky-700 hover:bg-sky-800 h-12 text-base font-semibold"
          >
            {isLoading ? "Carregando..." : "Entrar"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
