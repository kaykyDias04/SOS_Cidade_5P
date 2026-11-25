import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { usersAPI } from "@/src/lib/api";
import { ConfirmationModal } from "./confimation-form-dialog";
import { toast } from "sonner";

const gestorSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  confirmPassword: z.string().min(6, { message: "A confirmação de senha deve ter no mínimo 6 caracteres." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

interface CriarGestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CriarGestorModal = ({ isOpen, onClose, onSuccess }: CriarGestorModalProps) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingData, setPendingData] = useState<z.infer<typeof gestorSchema> | null>(null);

  const form = useForm<z.infer<typeof gestorSchema>>({
    resolver: zodResolver(gestorSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onFormSubmit = (data: z.infer<typeof gestorSchema>) => {
    setPendingData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingData) return;

    setIsSubmitting(true);
    try {
      const response = await usersAPI.createGestor({
        name: pendingData.name,
        email: pendingData.email,
        password: pendingData.password,
      });

      if (response.success) {
        toast.success("Gestor criado com sucesso!");
        form.reset();
        setIsConfirmationOpen(false);
        onClose();
        onSuccess();
      } else {
        const errorMsg = response.error || "";
        if (errorMsg.toLowerCase().includes("user already exists")) {
          toast.error("Este e-mail já está sendo usado por outro usuário.");
        } else {
          toast.error(errorMsg || "Erro ao criar novo gestor. Tente novamente.");
        }
        setIsConfirmationOpen(false);
      }
    } catch (err: any) {
      toast.error("Ocorreu uma falha na comunicação com o servidor.");
      setIsConfirmationOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !isConfirmationOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <DialogHeader>
                <DialogTitle>Criar Usuário Gestor</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para cadastrar um novo gestor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
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
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ex: joao@soscidade.com" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmação de Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer bg-sky-700 hover:bg-sky-800 text-white">
                  Cadastrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirmar Cadastro"
        description={`Tem certeza que deseja cadastrar o gestor "${pendingData?.name}" (${pendingData?.email})?`}
        isPending={isSubmitting}
      />
    </>
  );
};
