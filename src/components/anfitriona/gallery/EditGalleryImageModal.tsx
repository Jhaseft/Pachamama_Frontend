import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Switch, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GalleryItem } from '../../../types/gallery';
import { apiUpdateGalleryImage } from '../../../api/anfitrionaGallery';

type Props = {
  item: GalleryItem | null;
  visible: boolean;
  onClose: () => void;
  onSaved: (updated: GalleryItem) => void;
};

export default function EditGalleryImageModal({ item, visible, onClose, onSaved }: Props) {
  const insets = useSafeAreaInsets();

  const [isPremium, setIsPremium] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [unlockCredits, setUnlockCredits] = useState('');
  const [saving, setSaving] = useState(false);

  // Sincronizar estado cuando cambia el item
  useEffect(() => {
    if (item) {
      setIsPremium(item.isPremium);
      setIsVisible(item.isVisible);
      setUnlockCredits(item.unlockCredits != null ? String(item.unlockCredits) : '');
    }
  }, [item]);

  if (!item) return null;

  const handleSave = async () => {
    if (isPremium) {
      const credits = parseInt(unlockCredits);
      if (!unlockCredits || isNaN(credits) || credits <= 0) {
        Alert.alert('Error', 'Las fotos premium requieren un precio en créditos mayor a 0.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Parameters<typeof apiUpdateGalleryImage>[1] = {
        isPremium,
        isVisible,
      };
      if (isPremium) {
        payload.unlockCredits = parseInt(unlockCredits);
      }
      const updated = await apiUpdateGalleryImage(item.id, payload);
      onSaved(updated);
      onClose();
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Editar foto</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Toggle: Visible en perfil */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name={isVisible ? 'eye' : 'eye-off'}
                size={20}
                color={isVisible ? '#4ade80' : '#a1a1aa'}
              />
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>Visible en mi perfil</Text>
                <Text style={styles.rowSub}>
                  {isVisible ? 'Los clientes pueden ver esta foto' : 'Foto oculta, no aparece en tu perfil'}
                </Text>
              </View>
            </View>
            <Switch
              value={isVisible}
              onValueChange={setIsVisible}
              trackColor={{ false: '#3f3f46', true: '#166534' }}
              thumbColor={isVisible ? '#4ade80' : '#a1a1aa'}
            />
          </View>

          {/* Toggle: Foto premium */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="lock"
                size={20}
                color={isPremium ? '#ef4444' : '#a1a1aa'}
              />
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>Foto exclusiva (premium)</Text>
                <Text style={styles.rowSub}>
                  {isPremium ? 'El cliente paga créditos para verla' : 'Foto visible sin costo'}
                </Text>
              </View>
            </View>
            <Switch
              value={isPremium}
              onValueChange={setIsPremium}
              trackColor={{ false: '#3f3f46', true: '#7f1d1d' }}
              thumbColor={isPremium ? '#ef4444' : '#a1a1aa'}
            />
          </View>

          {/* Precio en créditos (solo si premium) */}
          {isPremium && (
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Precio en créditos</Text>
              <TextInput
                style={styles.input}
                value={unlockCredits}
                onChangeText={setUnlockCredits}
                keyboardType="numeric"
                placeholder="Ej: 30"
                placeholderTextColor="#52525b"
              />
            </View>
          )}

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  rowTexts: {
    flex: 1,
  },
  rowLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  inputRow: {
    backgroundColor: '#27272a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  inputLabel: {
    color: '#a1a1aa',
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: '#3f3f46',
    paddingBottom: 4,
  },
  saveBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
