"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { usersAPI } from "@/src/lib/api";
import { useState } from "react";
import { ConsentAgreement } from "@/src/components/consent-agreement";

const registerSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  acceptedLegal: z.boolean().refine((value) => value, {
    message: "Confirme a leitura e aceite os documentos para continuar.",
  }),
});

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", acceptedLegal: false },
  });

  const onRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    try {
      const result = await usersAPI.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "DENUNCIANTE",
        acceptedTerms: data.acceptedLegal,
        acceptedPrivacy: data.acceptedLegal,
      });

      if (result.success) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
        form.reset();
      } else {
        const errorMsg = result.error || "";
        if (errorMsg.toLowerCase().includes("user already exists")) {
          toast.error("Este e-mail já está em uso. Tente outro.");
        } else {
          toast.error(errorMsg || "Não foi possível realizar o cadastro. Tente novamente.");
        }
      }
    } catch {
      toast.error("Ocorreu um erro inesperado ao realizar o cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Cadastro</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input className="bg-stone-100 h-12" placeholder="Seu Nome Completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="bg-stone-100 h-12" placeholder="seu.email@mail.com" {...field} />
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
                  <Input className="bg-stone-100 h-12" type="password" placeholder="******" {...field} />
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
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
