import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import type { PublishGalleryForm } from '../types/gallery';
import { apiCreateGalleryImage } from '../api/anfitrionaGallery';

type Options = {
  /** Callback que se ejecuta cuando la imagen se publicó con éxito */
  onSuccess: () => void;
};

export function useGalleryPublish({ onSuccess }: Options) {
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [form, setForm] = useState<PublishGalleryForm>({ isPremium: false, unlockCredits: '' });
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia(result.assets[0]);
      setModalVisible(true);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setSelectedMedia(null);
    setForm({ isPremium: false, unlockCredits: '' });
  };

  const validate = (): string | null => {
    if (!selectedMedia) return 'Selecciona una imagen.';
    if (form.isPremium) {
      const credits = parseInt(form.unlockCredits, 10);
      if (!form.unlockCredits || isNaN(credits) || credits <= 0) {
        return 'Las fotos exclusivas necesitan un precio en créditos mayor a 0.';
      }
    }
    return null;
  };

  const handlePublish = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Atención', error);
      return;
    }

    setUploading(true);
    try {
      const file = {
        uri: selectedMedia!.uri,
        type: 'image/jpeg',
        name: selectedMedia!.fileName ?? `gallery_${Date.now()}.jpg`,
      };

      await apiCreateGalleryImage(
        {
          isPremium: form.isPremium,
          unlockCredits: form.isPremium ? parseInt(form.unlockCredits, 10) : undefined,
        },
        file,
      );

      Alert.alert('¡Publicada!', 'Tu foto ya está en tu galería.');
      handleClose();
      onSuccess();
    } catch (err: any) {
      Alert.alert('Error', String(err?.response?.data?.message ?? err));
    } finally {
      setUploading(false);
    }
  };

  return {
    selectedMedia,
    form,
    setForm,
    modalVisible,
    uploading,
    pickImage,
    handleClose,
    handlePublish,
  };
}
