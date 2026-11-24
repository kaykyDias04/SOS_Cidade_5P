import { Row } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Edit } from "lucide-react";
import { ConfirmationModal } from "./confimation-form-dialog";
import { type DenunciaRow } from "./gestor-data-table";
import { useState } from "react";
import { denunciasAPI } from "@/src/lib/api";
import { useDenunciasStore } from "@/src/store/useDenunciasStore";
import { toast } from "sonner";

export const EditStatusCell = ({ row, table }: { row: Row<DenunciaRow>; table?: any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelectNovaSituacao = (novaSituacao: string) => {
    if (novaSituacao.toLowerCase() === row.original.situacao.toLowerCase()) return;

    setPendingStatus(novaSituacao);
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);

    try {
      const denuncias = useDenunciasStore.getState().denuncias;
      const denuncia = denuncias.find(d => d.protocolo === row.original.protocolo);

      if (denuncia) {
        const response = await denunciasAPI.update(denuncia.id, { situacao: pendingStatus });

        if (response.success) {
          toast.success(`Status atualizado para "${pendingStatus}"`);
        }
        if (response.error) {
          toast.error("Não foi possível atualizar o status no momento. Tente novamente.");
          return;
        }
      }

      const tableMeta = table?.options.meta as any;
      if (tableMeta && tableMeta.updateRow) {
        tableMeta.updateRow(row.original.protocolo, pendingStatus);
      }

      useDenunciasStore.getState().updateDenunciaLocalmente(row.original.protocolo, pendingStatus);

    } catch (error) {
      toast.error("Houve um problema ao salvar as alterações.");
    } finally {
      setIsUpdating(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 cursor-pointer">
            <Edit className="w-3 h-3 mr-2" />
            Editar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleSelectNovaSituacao("Em andamento")}
            // Finalizada não volta para Em andamento: o backend recusa com 409.
            disabled={["em andamento", "finalizada", "resolvido"].includes(row.original.situacao.toLowerCase())}
          >
            Em andamento
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSelectNovaSituacao("Finalizada")}
            disabled={["finalizada", "resolvido"].includes(row.original.situacao.toLowerCase())}
          >
            Finalizada
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isUpdating && setIsModalOpen(false)}
        onConfirm={handleConfirmUpdate}
        title="Atualizar Situação"
        description={`Tem certeza que deseja alterar o status da denúncia (Protocolo: ${row.original.protocolo}) para "${pendingStatus.toUpperCase()}"?`}
        isPending={isUpdating}
      />
    </>
  );
};