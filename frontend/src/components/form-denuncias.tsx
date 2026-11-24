"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { ImagePlus, X } from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useDenunciasStore } from "@/src/store/useDenunciasStore";

import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

import { ConfirmationModal } from "./confimation-form-dialog";
import { ProtocolModal } from "./protocol-modal";

const BAIRROS_RECIFE = [
  "Afogados",
  "Água Fria",
  "Arruda",
  "Beberibe",
  "Boa Viagem",
  "Boa Vista",
  "Brasília Teimosa",
  "Campo Grande",
  "Casa Amarela",
  "Caxangá",
  "Coelhos",
  "Cordeiro",
  "Derby",
  "Dois Irmãos",
  "Encruzilhada",
  "Espinheiro",
  "Graças",
  "Ibura",
  "Imbiribeira",
  "IPSEP",
  "Iputinga",
  "Jaqueira",
  "Jardim São Paulo",
  "Madalena",
  "Mustardinha",
  "Parnamirim",
  "Pina",
  "Prado",
  "Recife (Centro)",
  "Rosarinho",
  "San Martin",
  "Santo Amaro",
  "São José",
  "Tamarineira",
  "Tejipió",
  "Torre",
  "Torreão",
  "Várzea",
];

const denunciaSchema = z.object({
  tipoDenuncia: z.enum([
    "PODA_ARVORE", "CALCADA_IRREGULAR", "FOCO_DENGUE", "SINALIZACAO_DANIFICADA",
    "LIMPEZA_BUEIRO", "MANUTENCAO_PARQUE", "ANIMAL_SOLTO", "POLUICAO_SONORA",
    "VAZAMENTO_AGUA", "TERRENO_BALDIO", "FALTA_AGUA", "LIXO",
    "BURACO_VIA", "ILUMINACAO"
  ], { message: "Selecione o tipo da denúncia." }),
  isAnonima: z.boolean().default(true),
  bairro: z.string().min(2, { message: "Selecione o bairro da ocorrência." }),
  descricao: z
    .string()
    .min(20, { message: "Descreva com no mínimo 20 caracteres." }),
  consentimento: z
    .boolean()
    .refine((val) => val === true, { message: "Você precisa autorizar o compartilhamento dos dados." }),
});

type DenunciaFormData = z.input<typeof denunciaSchema>;

const tipoLabels: Record<string, string> = {
  PODA_ARVORE: "Poda de Árvore / Árvore Caída",
  CALCADA_IRREGULAR: "Calçada Irregular",
  FOCO_DENGUE: "Foco de Dengue / Água Parada",
  SINALIZACAO_DANIFICADA: "Sinalização Danificada",
  LIMPEZA_BUEIRO: "Limpeza de Bueiro (Boca de Lobo)",
  MANUTENCAO_PARQUE: "Manutenção de Parques e Praças",
  ANIMAL_SOLTO: "Animal de Grande Porte Solto",
  POLUICAO_SONORA: "Poluição Sonora (Comercial/Obras)",
  VAZAMENTO_AGUA: "Vazamento de Água Potável",
  TERRENO_BALDIO: "Terreno Baldio Sujo",
  FALTA_AGUA: "Falta D'Água",
  LIXO: "Descarte Irregular de Lixo",
  BURACO_VIA: "Buraco na Via",
  ILUMINACAO: "Iluminação Pública",
};

export function FormDenuncias() {
  const form = useForm<DenunciaFormData>({
    resolver: zodResolver(denunciaSchema),
    defaultValues: {
      tipoDenuncia: "" as any,
      isAnonima: true,
      bairro: "",
      descricao: "",
      consentimento: false,
    },
  });

  const router = useRouter();
  const { user } = useAuthStore();
  const { createDenuncia, fetchDenuncias } = useDenunciasStore();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [dataToSubmit, setDataToSubmit] = useState<DenunciaFormData | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - imagens.length;
    if (remaining <= 0) return;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagens((prev) => [...prev, ev.target?.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  }

  function removeImage(idx: number) {
    setImagens((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleFormValidation(values: DenunciaFormData) {
    setDataToSubmit(values);
    setIsConfirmModalOpen(true);
  }

  async function handleConfirmSubmit() {
    if (!dataToSubmit) return;
    setIsPending(true);

    try {
      const anoAtual = new Date().getFullYear();
      const hashAleatorio = Math.random().toString(36).substring(2, 10).toUpperCase().padStart(8, '0');

      const generatedProtocolStr = `SOS-${anoAtual}-${hashAleatorio}`;
      const denunciaData = {
        tipoDenuncia: tipoLabels[dataToSubmit.tipoDenuncia] || dataToSubmit.tipoDenuncia,
        identificacao: !dataToSubmit.isAnonima,
        nomeDenunciante: !dataToSubmit.isAnonima ? (user?.name || "Anônimo") : "Anônimo",
        userId: user?.id,
        bairroOcorrencia: dataToSubmit.bairro,
        descricaoOcorrencia: dataToSubmit.descricao,
        dataOcorrencia: new Date().toLocaleDateString("pt-BR"),
        protocolo: generatedProtocolStr,
        situacao: "Em andamento",
        imagens: imagens.length > 0 ? imagens : undefined,
      };

      const result = await createDenuncia(denunciaData);

      if (result) {
        setGeneratedProtocol(result.protocolo || generatedProtocolStr);
        setIsConfirmModalOpen(false);
        setDataToSubmit(null);

        
        await fetchDenuncias();

        form.reset({
          tipoDenuncia: "" as any,
          isAnonima: true,
          bairro: "",
          descricao: "",
          consentimento: false,
        });

        setTimeout(() => {
          setIsProtocolModalOpen(true);
        }, 300);

        toast.success("Denúncia registrada com sucesso!");
      } else {
        toast.error("Ocorreu um problema ao registrar sua denúncia. Verifique os dados e tente novamente.");
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      toast.error("Não foi possível enviar sua denúncia. Verifique sua conexão com a internet.");
      console.error(error);
      setIsConfirmModalOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  function handleCloseModal() {
    form.reset();
    setIsConfirmModalOpen(false);
    setDataToSubmit(null);
  }

  function handleCloseProtocolModal() {
    setIsProtocolModalOpen(false);
    setGeneratedProtocol("");
    router.push("/homepage-denunciante");
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-4 lg:p-6">


        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormValidation)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="tipoDenuncia"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm">Tipo do Problema:</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm cursor-pointer">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="text-md" value="ANIMAL_SOLTO">Animal de Grande Porte Solto</SelectItem>
                      <SelectItem className="text-md" value="BURACO_VIA">Buraco na Via</SelectItem>
                      <SelectItem className="text-md" value="CALCADA_IRREGULAR">Calçada Irregular</SelectItem>
                      <SelectItem className="text-md" value="LIXO">Descarte Irregular de Lixo</SelectItem>
                      <SelectItem className="text-md" value="FALTA_AGUA">Falta D'Água</SelectItem>
                      <SelectItem className="text-md" value="FOCO_DENGUE">Foco de Dengue / Água Parada</SelectItem>
                      <SelectItem className="text-md" value="ILUMINACAO">Iluminação Pública</SelectItem>
                      <SelectItem className="text-md" value="LIMPEZA_BUEIRO">Limpeza de Bueiro (Boca de Lobo)</SelectItem>
                      <SelectItem className="text-md" value="MANUTENCAO_PARQUE">Manutenção de Parques e Praças</SelectItem>
                      <SelectItem className="text-md" value="PODA_ARVORE">Poda de Árvore / Árvore Caída</SelectItem>
                      <SelectItem className="text-md" value="POLUICAO_SONORA">Poluição Sonora (Comercial/Obras)</SelectItem>
                      <SelectItem className="text-md" value="SINALIZACAO_DANIFICADA">Sinalização Danificada</SelectItem>
                      <SelectItem className="text-md" value="TERRENO_BALDIO">Terreno Baldio Sujo</SelectItem>
                      <SelectItem className="text-md" value="VAZAMENTO_AGUA">Vazamento de Água Potável</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAnonima"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm">Como deseja registrar?</FormLabel>
                  <div role="radiogroup" aria-label="Identificação da denúncia" className="space-y-2">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={field.value}
                      onClick={() => field.onChange(true)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${
                        field.value ? "border-sky-700 bg-sky-50" : "border-stone-200 bg-gray-50/50"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          field.value ? "border-sky-700" : "border-stone-400"
                        }`}
                      >
                        {field.value && <span className="size-2.5 rounded-full bg-sky-700" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">Denunciar anonimamente</span>
                        <span className="mt-1 block text-xs text-stone-600">
                          Pré-selecionado. Gestores não verão seu nome; o vínculo interno com sua conta é mantido para acompanhamento.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={!field.value}
                      onClick={() => field.onChange(false)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left ${
                        !field.value ? "border-sky-700 bg-sky-50" : "border-stone-200 bg-gray-50/50"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                          !field.value ? "border-sky-700" : "border-stone-400"
                        }`}
                      >
                        {!field.value && <span className="size-2.5 rounded-full bg-sky-700" />}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">Identificar-me</span>
                        <span className="mt-1 block text-xs text-stone-600">
                          Seu nome será associado à denúncia.
                        </span>
                      </span>
                    </button>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bairro"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm">Bairro / Região (Recife):</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm cursor-pointer">
                        <SelectValue placeholder="Selecione o bairro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {BAIRROS_RECIFE.map((bairro) => (
                        <SelectItem key={bairro} className="text-sm" value={bairro}>
                          {bairro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm">Descrição do Problema:</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o problema com o máximo de detalhes: localização exata, gravidade, há quanto tempo existe..."
                      className="resize-none placeholder:text-sm h-auto min-h-[100px]"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Campo de imagens — opcional, até 4 */}
            <div className="w-full space-y-2">
              <p className="text-sm font-medium leading-none">
                Fotos da Ocorrência{" "}
                <span className="text-stone-400 font-normal">(opcional, até 4)</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex flex-wrap gap-3">
                {imagens.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-200 group">
                    <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
                {imagens.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-sky-400 hover:text-sky-500 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span className="text-[10px]">{imagens.length}/4</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Aceita JPG, PNG e WebP. Clique no preview para remover.
              </p>
            </div>

            <FormField
              control={form.control}
              name="consentimento"
              render={({ field }) => (
                <FormItem className="w-full">
                  <div className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        className="cursor-pointer"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer leading-tight">
                      Autorizo o compartilhamento desta denúncia com os órgãos competentes da Prefeitura do Recife
                    </FormLabel>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full md:w-auto px-12 cursor-pointer bg-sky-700 hover:bg-sky-800 text-white font-semibold"
              >
                Enviar Denúncia
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSubmit}
        isPending={isPending}
        title="Confirmar Envio da Denúncia"
        description="Você confirma o registro desta denúncia urbana? Ela será encaminhada ao órgão responsável da Prefeitura do Recife."
        confirmButtonText="Confirmar"
        cancelButtonText="Cancelar"
      />

      <ProtocolModal
        isOpen={isProtocolModalOpen}
        onClose={handleCloseProtocolModal}
        onConfirm={handleCloseProtocolModal}
        title="Denúncia Registrada com Sucesso!"
        description={`Sua denúncia foi encaminhada. Anote o número de protocolo para acompanhamento: ${generatedProtocol}`}
      />
    </>
  );
}
