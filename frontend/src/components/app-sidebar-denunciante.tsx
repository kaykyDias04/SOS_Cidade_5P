'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/src/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDenuncias } from "@/src/hooks/useDenuncias";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useMemo } from "react";

const items = [
  { title: "Início", url: "/homepage-denunciante" },
  { title: "Minhas Denúncias", url: "/minhas-denuncias" },
  { title: "Nova Denúncia", url: "/nova-denuncia" },
];

const getStatusColor = (situacao: string) => {
  const s = situacao.toLowerCase();
  if (s.includes("finalizada")) return "bg-green-500";
  if (s.includes("andamento")) return "bg-orange-400";
  return "bg-blue-400";
};

export function AppSidebarDenunciante() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { denuncias, loading } = useDenuncias(1, 50);

  const denunciasRecentes = useMemo(() => {
    return (denuncias || [])
      .slice(0, 2)
      .map((d) => ({
        id: d.protocolo,
        tipoDenuncia: d.tipoDenuncia,
        status: d.situacao,
        statusColor: getStatusColor(d.situacao),
      }));
  }, [denuncias]);

  return (
    <Sidebar className="bg-stone-100 p-6 flex flex-col">
      <SidebarHeader className="flex flex-col items-center bg-stone-100 text-center gap-1.5">
        <div className="relative w-14 h-14 bg-sky-700 rounded-full flex items-center justify-center shadow-md">
          <img src="/logo.svg" alt="Logo" className="w-9 h-9" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sky-700">S.O.S Cidade</h1>
          <p className="text-xs text-stone-600">
            Olá, {user?.name ? user.name.split(' ')[0] : "Cidadão"}
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-stone-100 pt-10">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title} className="mb-2">
                <Link
                  href={item.url}
                  className={`
                    flex items-center w-full p-2 rounded-lg text-sm font-semibold
                    transition-colors duration-200
                    ${isActive ? "bg-sky-700 text-white" : "text-stone-700 hover:bg-stone-200"}
                  `}
                >
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto pt-4 border-t bg-stone-100 border-stone-200">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-stone-200">
          <h2 className="text-xs uppercase tracking-wide font-bold text-center text-stone-800 mb-2">
            Minhas Denúncias Recentes
          </h2>
          <div className="space-y-3">
            {loading && denunciasRecentes.length === 0 ? (
              <p className="text-center text-xs text-stone-500 animate-pulse">Carregando...</p>
            ) : denunciasRecentes.length > 0 ? (
              denunciasRecentes.map((d) => (
                <div key={d.id} className="p-3 bg-stone-50 rounded-lg border border-stone-100 hover:border-sky-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1.5">
                      <p className="font-bold text-sky-700 text-sm leading-none">{d.tipoDenuncia || 'Denúncia'}</p>
                      <p className="text-xs text-stone-500 font-mono leading-none">{d.id}</p>
                      <p className="text-xs text-stone-400 leading-none mt-1">{d.status}</p>
                    </div>
                    <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${d.statusColor} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${d.statusColor}`}></span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-stone-500 py-2">Nenhuma denúncia registrada</p>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-stone-500 mt-4">
          Prefeitura do Recife: (81) 3355-8000
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
