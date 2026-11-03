"use client";

import { useEffect, useState, useMemo } from "react";
import { DenuncianteDenunciasDataTable, type DenunciaRow } from "@/src/components/denunciante-data-table";
import { useAuthStore } from "@/src/store/useAuthStore";
import { denunciasAPI } from "@/src/lib/api";
import { DataTableSkeleton } from "@/src/components/data-table-skeleton";

export default function MinhasDenunciasPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DenunciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDenuncias = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      let allData: any[] = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES = 10;

      while (hasMore && page <= MAX_PAGES) {
        const res = await denunciasAPI.listMinhas(page, 100);
        if (res.success && res.data) {
          const paginatedData = res.data as any;
          const items = Array.isArray(paginatedData) ? paginatedData : (paginatedData.data || []);
          allData = [...allData, ...items];

          if (items.length < 100) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          throw new Error(res.error || "Erro ao carregar");
        }
      }

      const filtered = allData
        .filter((d) => {
          if (user.id && d.userId) {
            return String(d.userId) === String(user.id);
          }
          return d.nomeDenunciante === user.name;
        })
        .map((d) => ({
          id: d.id,
          tipoDenuncia: d.tipoDenuncia,
          identificacao: d.identificacao,
          nomeDenunciante: d.nomeDenunciante || "Anônimo",
          bairroOcorrencia: d.bairroOcorrencia || "",
          descricaoOcorrencia: d.descricaoOcorrencia,
          dataOcorrencia: d.dataOcorrencia,
          protocolo: d.protocolo,
          situacao: d.situacao,
          imagens: d.imagens,
        }));

      setData(filtered);
    } catch (e: any) {
      setError(e.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDenuncias();
  }, [user]);



  if (loading) {
    return (
      <div className="w-full">
        <DataTableSkeleton columns={6} rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar denúncias: {error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Verifique se o servidor está rodando em {process.env.NEXT_PUBLIC_API_URL}
          </p>
          <button
            onClick={fetchUserDenuncias}
            className="px-4 py-2 bg-sky-700 text-white rounded hover:bg-sky-800"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Minhas Denúncias</h1>
        <p className="text-sm sm:text-base text-slate-500">Acompanhe o status e o histórico das suas solicitações</p>
      </div>
      <div className="w-full bg-white rounded-xl shadow-sm border border-stone-200 p-2 sm:p-4">
        <DenuncianteDenunciasDataTable data={data} />
      </div>
    </div>
  );
}
