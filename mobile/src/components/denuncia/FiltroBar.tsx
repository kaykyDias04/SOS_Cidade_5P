import { ScrollView, Text, StyleSheet } from 'react-native';
import type { DenunciaFiltros } from '@/types';
import { SITUACOES } from '@/constants';
import Chip from '@/components/ui/Chip';
import { colors } from '@/constants/theme';

interface FiltroLinhaProps {
  titulo: string;
  opcoes: string[];
  valor?: string;
  onChange: (value: string | undefined) => void;
}

function FiltroLinha({ titulo, opcoes, valor, onChange }: FiltroLinhaProps) {
  if (opcoes.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtros}
      style={styles.row}
    >
      <Text style={styles.titulo}>{titulo}:</Text>
      {[undefined, ...opcoes].map((opcao) => (
        <Chip
          key={String(opcao)}
          label={opcao ?? 'Todos'}
          selected={valor === opcao}
          onPress={() => onChange(opcao)}
          accessibilityLabel={`Filtrar ${titulo} ${opcao ?? 'todos'}`}
        />
      ))}
    </ScrollView>
  );
}

interface FiltroBarProps {
  filtros: DenunciaFiltros;
  opcoes: { tipos: string[]; bairros: string[] };
  onChange: (filtros: DenunciaFiltros) => void;
}

export default function FiltroBar({ filtros, opcoes, onChange }: FiltroBarProps) {
  return (
    <>
      <FiltroLinha
        titulo="Status"
        opcoes={SITUACOES}
        valor={filtros.situacao}
        onChange={(situacao) => onChange({ situacao })}
      />
      <FiltroLinha
        titulo="Tipo"
        opcoes={opcoes.tipos}
        valor={filtros.tipoDenuncia}
        onChange={(tipoDenuncia) => onChange({ tipoDenuncia })}
      />
      <FiltroLinha
        titulo="Região"
        opcoes={opcoes.bairros}
        valor={filtros.bairroOcorrencia}
        onChange={(bairroOcorrencia) => onChange({ bairroOcorrencia })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexGrow: 0, flexShrink: 0, height: 40, marginBottom: 8 },
  filtros: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  titulo: { fontSize: 12, fontWeight: '800', color: colors.primaryDark },
});
