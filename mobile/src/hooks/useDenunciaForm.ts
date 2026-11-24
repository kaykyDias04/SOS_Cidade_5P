import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { SITUACAO_INICIAL } from '@/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { useDenunciasStore } from '@/store/useDenunciasStore';
import { hasErrors, validarDenuncia, type DenunciaErrors } from '@/utils/validation';

export function useDenunciaForm() {
  const { user } = useAuthStore();
  const { createDenuncia } = useDenunciasStore();

  const [tipoDenuncia, setTipoDenuncia] = useState('');
  const [bairro, setBairro] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [identificacao, setIdentificacao] = useState(false);
  const [imagens, setImagens] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<DenunciaErrors>({});

  const changeTipo = (value: string) => {
    setTipoDenuncia(value);
    setErrors((current) => ({ ...current, tipo: '' }));
  };

  const changeBairro = (value: string) => {
    setBairro(value);
    setErrors((current) => ({ ...current, bairro: '' }));
  };

  const changeDescricao = (value: string) => {
    setDescricao(value);
    setErrors((current) => ({ ...current, descricao: '' }));
  };

  const validate = () => {
    const validationErrors = validarDenuncia({ tipoDenuncia, bairro, descricao });
    setErrors(validationErrors);
    return !hasErrors(validationErrors);
  };

  const submit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const result = await createDenuncia({
        tipoDenuncia,
        identificacao,
        nomeDenunciante: identificacao ? (user?.name || 'Anônimo') : 'Anônimo',
        userId: user?.id,
        bairroOcorrencia: bairro.trim(),
        descricaoOcorrencia: descricao.trim(),
        dataOcorrencia: data,
        protocolo: '',
        situacao: SITUACAO_INICIAL,
        imagens: imagens.length > 0 ? imagens : null,
      });

      if (result) {
        setProtocolo(result.protocolo);
        setShowSuccessModal(true);
        setTipoDenuncia('');
        setBairro('');
        setDescricao('');
        setImagens([]);
        setIdentificacao(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: useDenunciasStore.getState().error || 'Não foi possível registrar a denúncia.',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tipoDenuncia,
    bairro,
    descricao,
    data,
    identificacao,
    imagens,
    submitting,
    protocolo,
    showSuccessModal,
    errors,
    changeTipo,
    changeBairro,
    changeDescricao,
    setData,
    setIdentificacao,
    setImagens,
    setShowSuccessModal,
    submit,
  };
}
