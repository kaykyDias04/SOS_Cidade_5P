import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { useNovaDenunciaViewModel } from '../viewmodels/useNovaDenunciaViewModel';
import { Denuncia } from '../models/Denuncia';

interface Props {
  onSucesso: (denuncia: Denuncia) => void;
}

export function NovaDenunciaScreen({ onSucesso }: Props) {
  const vm = useNovaDenunciaViewModel(onSucesso);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Nova Denúncia</Text>

      <TextInput
        style={styles.input}
        placeholder="Tipo do problema (ex: Buraco na Via)"
        value={vm.tipoDenuncia}
        onChangeText={vm.setTipoDenuncia}
      />

      <TextInput
        style={styles.input}
        placeholder="Bairro"
        value={vm.bairroOcorrencia}
        onChangeText={vm.setBairroOcorrencia}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva o que está acontecendo (mín. 20 caracteres)"
        value={vm.descricaoOcorrencia}
        onChangeText={vm.setDescricaoOcorrencia}
        multiline
        numberOfLines={4}
      />

      <View style={styles.switchRow}>
        <Text>Quero me identificar</Text>
        <Switch value={vm.identificacao} onValueChange={vm.setIdentificacao} />
      </View>

      {vm.identificacao && (
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={vm.nomeDenunciante}
          onChangeText={vm.setNomeDenunciante}
        />
      )}

      {vm.errorMessage && <Text style={styles.error}>{vm.errorMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={vm.handleEnviar} disabled={vm.loading}>
        {vm.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Denúncia</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: '#dc2626', marginBottom: 12 },
});
