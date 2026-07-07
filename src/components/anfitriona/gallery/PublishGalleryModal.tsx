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
import { LinearGradient } from 'expo-linear-gradient';

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
              <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 24 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ flex: 1, backgroundColor: 'rgba(19, 38, 115, 0.2)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#132673' }}
                >
                  <Text style={{ color: '#132673', fontWeight: '700' }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onPublish}
                  disabled={uploading}
                  style={{ flex: 1 }}
                >
                  <LinearGradient
                    colors={['#f03eb3', '#a844f2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {uploading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={{ color: 'white', fontWeight: '700' }}>Publicar</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
