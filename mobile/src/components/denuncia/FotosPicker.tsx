import { Alert, Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { colors } from '@/constants/theme';

const MAX_IMAGES = 4;

interface FotosPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function FotosPicker({ images, onChange }: FotosPickerProps) {
  const checkLimit = () => {
    if (images.length < MAX_IMAGES) return true;
    Toast.show({ type: 'info', text1: 'Limite atingido', text2: 'Máximo de 4 imagens por denúncia.' });
    return false;
  };

  const selectImage = async (source: 'camera' | 'gallery') => {
    if (!checkLimit()) return;

    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(
        'Permissão negada',
        source === 'camera' ? 'Permita o acesso à câmera.' : 'Permita o acesso à galeria.'
      );
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsMultipleSelection: false,
    };
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets[0]?.base64) {
      onChange([...images, `data:image/jpeg;base64,${result.assets[0].base64}`]);
    }
  };

  const chooseImageSource = () => {
    if (!checkLimit()) return;
    Alert.alert('Adicionar imagem', 'Escolha uma opção', [
      { text: 'Câmera', onPress: () => { void selectImage('camera'); } },
      { text: 'Galeria', onPress: () => { void selectImage('gallery'); } },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Imagens (máx. 4)</Text>
      <View style={styles.imageRow}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.imageThumb} />
            <TouchableOpacity
              style={styles.imageRemove}
              onPress={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
              accessibilityLabel={`Remover imagem ${index + 1}`}
            >
              <Ionicons name="close-circle" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < MAX_IMAGES && (
          <TouchableOpacity
            style={styles.addImageBtn}
            onPress={chooseImageSource}
            accessibilityLabel="Adicionar imagem"
          >
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
            <Text style={styles.addImageText}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageWrapper: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 12 },
  imageRemove: { position: 'absolute', top: -8, right: -8 },
  addImageBtn: {
    width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: '#bfdbfe',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceTint, gap: 4,
  },
  addImageText: { fontSize: 11, color: colors.primary, fontWeight: '700' },
});
