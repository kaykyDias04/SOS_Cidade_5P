import { useState } from 'react';
import { DenunciaService } from '../services/denunciaService';
import { Denuncia } from '../models/Denuncia';

export function useNovaDenunciaViewModel(onSucesso: (denuncia: Denuncia) => void) {
  const [tipoDenuncia, setTipoDenuncia] = useState('');
  const [bairroOcorrencia, setBairroOcorrencia] = useState('');
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState('');
  const [identificacao, setIdentificacao] = useState(false);
  const [nomeDenunciante, setNomeDenunciante] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEnviar() {
    setErrorMessage(null);

    if (!tipoDenuncia || !bairroOcorrencia || descricaoOcorrencia.length < 20) {
      setErrorMessage('Preencha tipo, bairro e uma descrição com pelo menos 20 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const denuncia = await DenunciaService.criar({
        tipoDenuncia,
        bairroOcorrencia,
        descricaoOcorrencia,
        identificacao,
        // Só manda o nome se a pessoa realmente quis se identificar —
        // o ViewModel garante isso do lado do app, mas o backend
        // ainda precisa ser corrigido para garantir isso também
        // (ver documento de Requisitos de Segurança, gap RS-07).
        nomeDenunciante: identificacao ? nomeDenunciante : undefined,
      });
      onSucesso(denuncia);
    } catch (error: any) {
      setErrorMessage(error.message || 'Não foi possível enviar a denúncia.');
    } finally {
      setLoading(false);
    }
  }

  return {
    tipoDenuncia,
    setTipoDenuncia,
    bairroOcorrencia,
    setBairroOcorrencia,
    descricaoOcorrencia,
    setDescricaoOcorrencia,
    identificacao,
    setIdentificacao,
    nomeDenunciante,
    setNomeDenunciante,
    loading,
    errorMessage,
    handleEnviar,
  };
}
