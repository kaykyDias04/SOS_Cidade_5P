"use client";

import Link from "next/link";
import { Camera, Search, Settings, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-[#f4f4f4] font-sans flex flex-col flex-1 min-h-0">

      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#6498c9] rounded-full flex items-center justify-center shadow-sm">
            <img src="/logo.svg" alt="S.O.S Cidade Logo" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-[#6498c9] font-bold text-xl sm:text-2xl tracking-tight">
            S.O.S Cidade
          </h1>
        </div>
        <Link
          href="/login"
          className="text-[#6498c9] font-bold text-xs px-4 py-1.5 border-2 border-[#6498c9] rounded hover:bg-blue-50 transition-colors uppercase"
        >
          Entrar
        </Link>
      </header>

      <section className="relative w-full shrink-0" style={{ height: 'clamp(150px, 26vh, 320px)' }}>
        <img
          src="/homepage-assets/Recife-1024x683.jpg"
          alt="Recife"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-4">
          <h2
            className="text-white text-xl sm:text-3xl lg:text-4xl font-bold max-w-4xl mb-2 sm:mb-3 leading-tight drop-shadow-lg"
            style={{ WebkitTextStroke: "0.8px rgba(0,0,0,1)" }}
          >
            Sua voz ajuda a construir uma cidade melhor
          </h2>
          <p className="text-white text-sm max-w-2xl mb-3 sm:mb-5 font-medium drop-shadow-md hidden sm:block">
            Relate problemas do cotidiano urbano, infraestrutura ou segurança de forma rápida e segura
          </p>
          <Link
            href="/login"
            className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2 sm:py-2.5 px-5 sm:px-7 rounded-md transition-colors text-xs sm:text-sm shadow-lg uppercase"
          >
            Faça sua denúncia agora
          </Link>
        </div>
      </section>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7 flex flex-col gap-6 sm:gap-8 overflow-y-auto">

        <section className="flex flex-col items-center w-full">
          <h2 className="text-[#6498c9] text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
            Como Funciona
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full">
            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Camera size={40} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-black mb-1">1. RELATE</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  Escolha a categoria e descreva o problema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Search size={40} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-black mb-1">2. ACOMPANHE</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  Receba um número de protocolo e siga o status em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0 text-black">
                <Settings size={40} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm text-black mb-1">3. RESOLVA</h3>
                <p className="text-sm font-medium text-black leading-snug">
                  A prefeitura recebe o chamado e toma as providências
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row gap-5 items-stretch w-full pb-4">

          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 flex items-center gap-4 sm:gap-5 border border-gray-100">
              <div className="shrink-0 flex items-center justify-center">
                <Lock size={48} className="text-black" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[#6498c9] text-lg sm:text-xl font-bold text-left leading-tight">
                  Sua identidade está protegida
                </h2>
                <p className="font-medium text-black text-sm leading-snug">
                  Denúncias anônimas não exibem seu nome para gestores, mas permanecem vinculadas à sua conta para acompanhamento. Consulte a Política de Privacidade antes de enviar.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl shadow-sm w-full flex-1 relative min-h-[100px]">
              <img
                src="/homepage-assets/476837-PGTV1I-985.jpg"
                alt="Pessoas diversas"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          </div>

          <div className="flex-[1.2] flex flex-col w-full">
            <h2 className="text-[#6498c9] text-lg sm:text-2xl font-bold text-center leading-tight mb-4 sm:mb-5">
              O que você pode<br />denunciar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {[
                { title: "Foco de Dengue", icon: "mosquito icon.png" },
                { title: "Iluminação Pública", icon: "poste-de-iluminacao icon.png" },
                { title: "Falta D'água", icon: "abastecimento-de-agua icon.png" },
                { title: "Alagamento", icon: "enchente icon.png" },
                { title: "Descarte Irregular de Lixo", icon: "saco-de-lixo icon.png" },
                { title: "Buraco na Via", icon: "buraco na via icon.png" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm p-3 px-4 flex items-center gap-4 border border-gray-100 h-[76px] hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                    <img
                      src={`/homepage-assets/${item.icon}`}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="font-bold text-black text-sm leading-tight">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}