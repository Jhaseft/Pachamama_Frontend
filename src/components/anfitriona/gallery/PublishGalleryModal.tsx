import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { PublishGalleryForm } from '../../../types/gallery';
import ImageTypeSelector from './ImageTypeSelector';
import CreditsInput from './CreditsInput';

type Props = {
  visible: boolean;
  selectedMedia: ImagePickerAsset | null;
  form: PublishGalleryForm;
  uploading: boolean;
  onChangeForm: (patch: Partial<PublishGalleryForm>) => void;
  onClose: () => void;
  onPublish: () => void;
};

export default function PublishGalleryModal({
  visible,
  selectedMedia,
  form,
  uploading,
  onChangeForm,
  onClose,
  onPublish,
}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center bg-black/80 px-5"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden">

            {/* Header */}
            <View className="bg-zinc-800 px-5 py-4 border-b border-zinc-700">
              <Text className="text-white text-center font-bold text-base">
                Nueva publicación
              </Text>
            </View>

            <View className="p-4 items-center">

              {/* Preview */}
              {selectedMedia && (
                <View className="w-full h-56 bg-black rounded-xl overflow-hidden border border-zinc-700">
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Selector: normal / exclusiva */}
              <ImageTypeSelector
                isPremium={form.isPremium}
                onChange={(value) =>
                  onChangeForm({ isPremium: value, unlockCredits: '' })
                }
              />

              {/* Input de créditos (solo visible si es premium) */}
              {form.isPremium && (
                <CreditsInput
                  value={form.unlockCredits}
                  onChange={(v) => onChangeForm({ unlockCredits: v })}
                />
              )}

              {/* Hint contextual */}
              <Text className="text-zinc-500 text-xs text-center mt-3 px-2">
                {form.isPremium
                  ? 'Los usuarios necesitarán créditos para ver esta foto en tu perfil.'
                  : 'Esta foto será visible de forma gratuita en tu perfil.'}
              </Text>

              {/* Botones */}
              <View className="flex-row gap-3 w-full mt-6">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-zinc-700 py-3 rounded-xl items-center border border-zinc-600"
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onPublish}
                  disabled={uploading}
                  className="flex-1 bg-red-600 py-3 rounded-xl items-center border border-red-400"
                >
                  {uploading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-bold">Publicar</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
